package org.dubini.frontend_api.service;

import java.util.List;

import org.dubini.frontend_api.cache.CacheWarmable;
import org.dubini.frontend_api.cache.PersistentCaffeineCacheManager;
import org.dubini.frontend_api.client.ActivitiesClient;
import org.dubini.frontend_api.dto.PublicationDTO;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

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
                .doOnNext(data -> {
                    cache.put(CACHE_KEY, data);
                    log.info("Cache warmed up with {} activities", data.size());
                })
                .doOnSuccess(v -> {
                    if (cacheManager instanceof PersistentCaffeineCacheManager pcm) {
                        pcm.saveCache(CACHE_NAME);
                    }
                })
                .then();
    }

    public Mono<List<PublicationDTO>> get() {
        return activitiesClient.get()
                .transformDeferred(CircuitBreakerOperator.of(
                    circuitBreakerRegistry.circuitBreaker("activitiesCircuitBreaker")
                ))
                .doOnNext(activities -> {
                    Cache cache = cacheManager.getCache(CACHE_NAME);
                    if (cache != null) {
                        cache.put(CACHE_KEY, activities);
                        log.info("Cache updated with {} activities", activities.size());
                        
                        if (cacheManager instanceof PersistentCaffeineCacheManager pcm) {
                            pcm.saveCache(CACHE_NAME);
                        }
                    }
                })
                .onErrorResume(throwable -> {
                    log.warn("Backoffice unavailable ({}), loading activities from persistent cache", 
                             throwable.getClass().getSimpleName());
                    return getBackupActivities(throwable);
                });
    }

    @SuppressWarnings("unchecked")
    public Mono<List<PublicationDTO>> getBackupActivities(Throwable t) {
        log.info("Attempting to load activities from cache...");
        Cache cache = cacheManager.getCache(CACHE_NAME);
        
        if (cache != null) {
            List<PublicationDTO> cached = cache.get(CACHE_KEY, List.class);
            if (cached != null && !cached.isEmpty()) {
                log.info("✓ Returning {} activities from in-memory cache", cached.size());
                return Mono.just(cached);
            }
            log.info("In-memory cache empty, attempting to load from disk...");
            if (cacheManager instanceof PersistentCaffeineCacheManager pcm) {
                pcm.reloadCache(CACHE_NAME);

                cached = cache.get(CACHE_KEY, List.class);
                if (cached != null && !cached.isEmpty()) {
                    log.info("✓ Returning {} activities from disk cache", cached.size());
                    return Mono.just(cached);
                }
            }
        }
        
        log.error("✗ No cached activities available in memory or disk");
        return Mono.error(new RuntimeException("No cached activities available and backoffice is down", t));
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