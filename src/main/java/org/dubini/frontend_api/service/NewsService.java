package org.dubini.frontend_api.service;

import java.util.List;

import org.dubini.frontend_api.client.NewsClient;
import org.dubini.frontend_api.dto.PublicationDTO;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.AllArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@AllArgsConstructor
public class NewsService {

    private final NewsClient newsClient;
    private final CacheManager cacheManager;

    private static final String CACHE_NAME = "news";
    private static final String CACHE_KEY = "newsKey";

    @CircuitBreaker(name = "newsCircuitBreaker", fallbackMethod = "getBackupNews")
    public Mono<List<PublicationDTO>> get() {
        return Mono.defer(() -> {
            Cache cache = cacheManager.getCache(CACHE_NAME);

            if (cache != null) {
                List<PublicationDTO> cached = cache.get(CACHE_KEY, List.class);
                if (cached != null) {
                    return Mono.just(cached);
                }
            }

            return newsClient.get()
                .doOnNext(news -> {
                    if (cache != null) {
                        cache.put(CACHE_KEY, news);
                    }
                });
        });
    }

    @SuppressWarnings("unchecked")
    public Mono<List<PublicationDTO>> getBackupNews(Throwable t) {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        
        if (cache != null) {
            List<PublicationDTO> cached = cache.get(CACHE_KEY, List.class);
            if (cached != null) {
                return Mono.just(cached);
            }
        }
        
        return Mono.error(new RuntimeException("No cached news available", t));
    }

    public void clear() {
        Cache cache = cacheManager.getCache(CACHE_NAME); 
        if (cache != null) cache.clear();
        get().subscribe();
    }
}