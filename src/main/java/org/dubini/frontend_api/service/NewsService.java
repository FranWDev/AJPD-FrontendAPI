package org.dubini.frontend_api.service;

import java.time.Duration;
import java.util.List;

import org.dubini.frontend_api.cache.CacheWarmable;
import org.dubini.frontend_api.cache.PersistentCaffeineCacheManager;
import org.dubini.frontend_api.client.NewsClient;
import org.dubini.frontend_api.dto.PublicationDTO;
import org.dubini.frontend_api.exception.BackofficeException;
import org.dubini.frontend_api.exception.CacheException;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.reactor.circuitbreaker.operator.CircuitBreakerOperator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService implements CacheWarmable {

    private static final String CACHE_NAME = "news";
    private static final String CACHE_KEY = "newsKey";
    private static final String ETAG_KEY = "newsEtag";

    private final NewsClient newsClient;
    private final CacheManager cacheManager;
    private final CircuitBreakerRegistry circuitBreakerRegistry;
    private final CacheEtagService cacheEtagService;

    private CircuitBreaker getNewsCircuitBreaker() {
        return circuitBreakerRegistry.circuitBreaker("newsCircuitBreaker",
                () -> CircuitBreakerConfig.custom()
                        .failureRateThreshold(50)
                        .waitDurationInOpenState(Duration.ofSeconds(30))
                        .slidingWindowSize(10)
                        .build());
    }

    @Override
    public String getCacheName() {
        return CACHE_NAME;
    }

    @Override
    public Mono<Void> warmUpCache() {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache == null)
            return Mono.empty();

        cache.clear();

        return newsClient.get()
                .transformDeferred(CircuitBreakerOperator.of(getNewsCircuitBreaker()))
                .doOnNext(data -> {
                    cache.put(CACHE_KEY, data);
                    String etag = cacheEtagService.calculateEtag(data);
                    cache.put(ETAG_KEY, etag);
                    log.info("Cache warmed up with {} news items, ETag: {}", data.size(), etag);
                })
                .doOnSuccess(v -> {
                    if (cacheManager instanceof PersistentCaffeineCacheManager pcm) {
                        pcm.saveCache(CACHE_NAME);
                    }
                })
                .then()
                .onErrorResume(e -> {
                    log.warn("Backoffice failed during warmup, attempting fallback from disk: {}", e.getMessage());
                    return fallbackFromDisk(cache).then();
                });
    }

    @SuppressWarnings("unchecked")
    public Mono<List<PublicationDTO>> get() {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache == null) {
            log.error("✗ Cache {} no encontrada en CacheManager", CACHE_NAME);
            return Mono.error(new CacheException("Cache no inicializada"));
        }

        List<PublicationDTO> cached = cache.get(CACHE_KEY, List.class);
        if (cached != null && !cached.isEmpty()) {
            log.info("✓ Returning {} news from in-memory cache", cached.size());
            return Mono.just(cached);
        }

        log.warn("Cache empty, calling backoffice to populate it...");

        return newsClient.get()
                .transformDeferred(CircuitBreakerOperator.of(getNewsCircuitBreaker()))
                .doOnNext(news -> {
                    cache.put(CACHE_KEY, news);
                    String etag = cacheEtagService.calculateEtag(news);
                    cache.put(ETAG_KEY, etag);
                    log.info("Cache updated with {} news items, ETag: {}", news.size(), etag);
                    if (cacheManager instanceof PersistentCaffeineCacheManager pcm) {
                        pcm.saveCache(CACHE_NAME);
                    }
                })
                .onErrorResume(e -> {
                    log.warn("Backoffice failed, attempting fallback from disk: {}", e.getMessage());
                    return fallbackFromDisk(cache);
                });
    }

    private Mono<List<PublicationDTO>> fallbackFromDisk(Cache cache) {
        if (cacheManager instanceof PersistentCaffeineCacheManager pcm) {
            log.info("In-memory cache empty, attempting to load from disk...");
            pcm.reloadCache(CACHE_NAME);

            @SuppressWarnings("unchecked")
            List<PublicationDTO> cached = cache.get(CACHE_KEY, List.class);
            if (cached != null && !cached.isEmpty()) {
                log.info("✓ Returning {} news from disk cache", cached.size());

                cache.put(CACHE_KEY, cached);

                String etag = cache.get(ETAG_KEY, String.class);
                if (etag == null) {
                    etag = cacheEtagService.calculateEtag(cached);
                    cache.put(ETAG_KEY, etag);
                    log.info("ETag recalculated and cached: {}", etag);
                } else {
                    log.info("ETag loaded from disk cache: {}", etag);
                }

                log.info("In-memory cache repopulated with {} news items from disk", cached.size());

                return Mono.just(cached);
            }
        }

        return Mono.error(new BackofficeException("Backoffice unavailable and no cache available"));
    }

    public void clear() {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache != null)
            cache.clear();

        if (cacheManager instanceof PersistentCaffeineCacheManager pcm) {
            pcm.saveCache(CACHE_NAME);
        }

        warmUpCache().subscribe();
    }

    public String getCurrentEtag() {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache == null) {
            log.warn("Cache not found when getting ETag");
            return null;
        }

        String etag = cache.get(ETAG_KEY, String.class);
        if (etag != null) {
            log.debug("ETag retrieved from cache: {}", etag);
            return etag;
        }

        @SuppressWarnings("unchecked")
        List<PublicationDTO> cached = cache.get(CACHE_KEY, List.class);
        if (cached != null && !cached.isEmpty()) {
            etag = cacheEtagService.calculateEtag(cached);
            cache.put(ETAG_KEY, etag);
            log.info("ETag calculated on demand and cached: {}", etag);
            return etag;
        }

        log.warn("No data available to calculate ETag");
        return null;
    }

    public String getNewsSnapshot() {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache == null)
            return "";

        @SuppressWarnings("unchecked")
        List<PublicationDTO> cached = cache.get(CACHE_KEY, List.class);
        if (cached == null || cached.isEmpty())
            return "";

        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(cached);
        } catch (Exception e) {
            log.error("Error generating news snapshot: {}", e.getMessage());
            return "";
        }
    }
}