package org.dubini.frontend_api.service;

import java.util.List;

import org.dubini.frontend_api.client.NewsClient;
import org.dubini.frontend_api.dto.PublicationDTO;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
    @Cacheable(CACHE_NAME)
    public Mono<List<PublicationDTO>> get() {
        return newsClient.get();
    }

    @SuppressWarnings("unchecked")
    public Mono<List<PublicationDTO>> getBackupNews(Throwable t) {
        Cache backupCache = cacheManager.getCache(CACHE_NAME);
        if (backupCache != null) {

            List<PublicationDTO> cachedNews = backupCache.get(CACHE_KEY, List.class);
            if (cachedNews != null) {
                return Mono.just(cachedNews);
            }
        }
        return Mono.error(new RuntimeException("No cached news available", t));
    }

    @SuppressWarnings("unused")
    @CacheEvict(value = CACHE_NAME, allEntries = true)
    public void clear() {
        Mono<List<PublicationDTO>> refreshCache = get();
    }
}
