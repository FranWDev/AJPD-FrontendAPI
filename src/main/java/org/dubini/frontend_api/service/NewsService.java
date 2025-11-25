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

    private final NewsClient newsClient;
    private final CacheManager cacheManager;
    private final CircuitBreakerRegistry circuitBreakerRegistry;

    /**
     * Registra y devuelve un CircuitBreaker con configuración explícita
     */
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
                    log.info("Cache warmed up with {} news items", data.size());
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
                    log.info("Cache updated with {} news items", news.size());
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

                // Repoblar la caché en memoria
                cache.put(CACHE_KEY, cached);
                log.info("In-memory cache repopulated with {} news items from disk", cached.size());

                return Mono.just(cached);
            }
        }

        return Mono.error(new BackofficeException("Backoffice unavailable and no cache available"));
    }

private String normalizeTitle(String title) {
    if (title == null) {
        return "";
    }
    
    return title.toLowerCase()
            .replaceAll("[áàäâ]", "a")
            .replaceAll("[éèëê]", "e")
            .replaceAll("[íìïî]", "i")
            .replaceAll("[óòöô]", "o")
            .replaceAll("[úùüû]", "u")
            .replaceAll("[ñ]", "n")
            .replaceAll("[^a-z0-9]+", "-")  // Reemplaza cualquier caracter no alfanumérico por guión
            .replaceAll("^-+|-+$", "")      // Elimina guiones al inicio y al final
            .trim();
}

public Mono<PublicationDTO> getByTitle(String title) {
    if (title == null || title.trim().isEmpty()) {
        return Mono.error(new IllegalArgumentException("Title cannot be null or empty"));
    }

    String normalizedRequestTitle = normalizeTitle(title);
    log.debug("Searching for news with normalized title: {}", normalizedRequestTitle);

    return get()
            .flatMap(newsList -> {
                PublicationDTO found = newsList.stream()
                        .filter(news -> {
                            if (news.getTitle() == null) {
                                return false;
                            }
                            String normalizedNewsTitle = normalizeTitle(news.getTitle());
                            return normalizedNewsTitle.equals(normalizedRequestTitle);
                        })
                        .findFirst()
                        .orElse(null);

                if (found != null) {
                    log.info("✓ Found news with title: {} (normalized: {})", found.getTitle(), normalizedRequestTitle);
                    return Mono.just(found);
                } else {
                    log.warn("✗ News with normalized title '{}' not found", normalizedRequestTitle);
                    return Mono.error(new BackofficeException(
                            String.format("News with title '%s' not found", title)));
                }
            });
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
