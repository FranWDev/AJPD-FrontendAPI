package org.dubini.frontend_api.service;

import java.time.Duration;
import java.util.List;

import org.dubini.frontend_api.cache.CacheWarmable;
import org.dubini.frontend_api.cache.PersistentCaffeineCacheManager;
import org.dubini.frontend_api.exception.BackofficeException;
import org.dubini.frontend_api.exception.CacheException;
import org.dubini.frontend_api.client.ActivitiesClient;
import org.dubini.frontend_api.dto.PublicationDTO;
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
public class ActivitiesService implements CacheWarmable {

    private static final String CACHE_NAME = "activities";
    private static final String CACHE_KEY = "activitiesKey";

    private final ActivitiesClient activitiesClient;
    private final CacheManager cacheManager;
    private final CircuitBreakerRegistry circuitBreakerRegistry;

    /**
     * Registra y devuelve un CircuitBreaker con configuración explícita
     */
    private CircuitBreaker getActivitiesCircuitBreaker() {
        return circuitBreakerRegistry.circuitBreaker("activitiesCircuitBreaker",
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

        return activitiesClient.get()
                .transformDeferred(CircuitBreakerOperator.of(getActivitiesCircuitBreaker()))
                .doOnNext(data -> {
                    cache.put(CACHE_KEY, data);
                    log.info("Cache warmed up with {} activities", data.size());
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
            log.info("✓ Returning {} activities from in-memory cache", cached.size());
            return Mono.just(cached);
        }

        log.warn("Cache empty, calling backoffice to populate it...");

        return activitiesClient.get()
                .transformDeferred(CircuitBreakerOperator.of(getActivitiesCircuitBreaker()))
                .doOnNext(activities -> {
                    cache.put(CACHE_KEY, activities);
                    log.info("Cache updated with {} activities", activities.size());
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
                log.info("✓ Returning {} activities from disk cache", cached.size());

                // Repoblar la caché en memoria
                cache.put(CACHE_KEY, cached);
                log.info("In-memory cache repopulated with {} activities from disk", cached.size());

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
}
