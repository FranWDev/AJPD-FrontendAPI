package org.dubini.frontend_api.service;

import java.util.List;

import org.dubini.frontend_api.client.ActivitiesClient;
import org.dubini.frontend_api.dto.PublicationDTO;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor    
public class ActivitiesService {

    private static final String CACHE_NAME = "activities";
    private static final String CACHE_KEY = "activitiesKey";

    private final ActivitiesClient activitiesClient;
    private final CacheManager cacheManager;

    @CircuitBreaker(name = "activitiesCircuitBreaker", fallbackMethod = "getBackupActivities")
    @Cacheable(CACHE_NAME)
    public Mono<List<PublicationDTO>> get() {
        return activitiesClient.get();
    }

    @SuppressWarnings("unchecked")
    public Mono<List<PublicationDTO>> getBackupActivities(Throwable t) {
        Cache backupCache = cacheManager.getCache(CACHE_NAME);
        if (backupCache != null) {

            List<PublicationDTO> cachedActivities= backupCache.get(CACHE_KEY, List.class);
            if (cachedActivities != null) {
                return Mono.just(cachedActivities);
            }
        }
        return Mono.error(new RuntimeException("No cached news available", t));
    }

    @SuppressWarnings("unused")
    @CacheEvict(value = "activities", allEntries = true)
    public void clear() {
        Mono<List<PublicationDTO>> refreshCache = get();
    }
}
