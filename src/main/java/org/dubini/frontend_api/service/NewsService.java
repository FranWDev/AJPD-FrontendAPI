package org.dubini.frontend_api.service;

import java.util.List;

import org.dubini.frontend_api.cache.CacheWarmable;
import org.dubini.frontend_api.cache.PersistentCaffeineCacheManager;
import org.dubini.frontend_api.client.NewsClient;
import org.dubini.frontend_api.dto.PublicationDTO;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.reactor.circuitbreaker.operator.CircuitBreakerOperator;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@AllArgsConstructor
public class NewsService implements CacheWarmable {

    private final NewsClient newsClient;
    private final CacheManager cacheManager;
    private final CircuitBreakerRegistry circuitBreakerRegistry;

    private static final String CACHE_NAME = "news";
    private static final String CACHE_KEY = "newsKey";

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
                .doOnNext(data -> {
                    cache.put(CACHE_KEY, data);
                    log.info("Cache warmed up with {} news items", data.size());
                })
                .doOnSuccess(v -> {
                    if (cacheManager instanceof PersistentCaffeineCacheManager pcm) {
                        pcm.saveCache(CACHE_NAME);
                    }
                })
                .then();
    }

    public Mono<List<PublicationDTO>> get() {
        return newsClient.get()
                .transformDeferred(CircuitBreakerOperator.of(
                    circuitBreakerRegistry.circuitBreaker("newsCircuitBreaker")
                ))
                .doOnNext(news -> {
                    Cache cache = cacheManager.getCache(CACHE_NAME);
                    if (cache != null) {
                        cache.put(CACHE_KEY, news);
                        log.info("Cache updated with {} news items", news.size());
                        
                        if (cacheManager instanceof PersistentCaffeineCacheManager pcm) {
                            pcm.saveCache(CACHE_NAME);
                        }
                    }
                })
                .onErrorResume(throwable -> {
                    log.warn("Backoffice unavailable ({}), loading from persistent cache", 
                             throwable.getClass().getSimpleName());
                    return getBackupNews(throwable);
                });
    }

    @SuppressWarnings("unchecked")
    public Mono<List<PublicationDTO>> getBackupNews(Throwable t) {
        log.info("Attempting to load news from cache...");
        Cache cache = cacheManager.getCache(CACHE_NAME);
        
        if (cache != null) {
            List<PublicationDTO> cached = cache.get(CACHE_KEY, List.class);
            if (cached != null && !cached.isEmpty()) {
                log.info("✓ Returning {} news from in-memory cache", cached.size());
                return Mono.just(cached);
            }

            log.info("In-memory cache empty, attempting to load from disk...");
            if (cacheManager instanceof PersistentCaffeineCacheManager pcm) {
                pcm.reloadCache(CACHE_NAME);

                cached = cache.get(CACHE_KEY, List.class);
                if (cached != null && !cached.isEmpty()) {
                    log.info("✓ Returning {} news from disk cache", cached.size());
                    return Mono.just(cached);
                }
            }
        }
        
        log.error("✗ No cached news available in memory or disk");
        return Mono.error(new RuntimeException("No cached news available and backoffice is down", t));
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
}