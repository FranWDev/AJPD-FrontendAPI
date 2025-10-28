package org.dubini.frontend_api.service;

import java.util.List;

import org.dubini.frontend_api.client.ActivitiesClient;
import org.dubini.frontend_api.dto.PublicationDTO;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
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
    public Mono<List<PublicationDTO>> get() {
        return Mono.defer(() -> {
            Cache cache = cacheManager.getCache(CACHE_NAME);

            if (cache != null) {
                List<PublicationDTO> cached = cache.get(CACHE_KEY, List.class);
                if (cached != null) {
                    System.out.println("Activities cache hit");
                    return Mono.just(cached);
                }
            }
            
            System.out.println("Activities cache miss - fetching from client");
            return activitiesClient.get()
                .doOnNext(activities -> {
                    if (cache != null) {
                        cache.put(CACHE_KEY, activities);
                    }
                });
        });
    }

    @SuppressWarnings("unchecked")
    public Mono<List<PublicationDTO>> getBackupActivities(Throwable t) {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        
        if (cache != null) {
            List<PublicationDTO> cached = cache.get(CACHE_KEY, List.class);
            if (cached != null) {
                return Mono.just(cached);
            }
        }
        
        return Mono.error(new RuntimeException("No cached activities available", t));
    }

    public void clear() {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        
        if (cache != null) cache.clear();

        get().subscribe();
    }
}