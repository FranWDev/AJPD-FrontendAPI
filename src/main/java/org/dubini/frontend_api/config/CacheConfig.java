package org.dubini.frontend_api.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();

        CaffeineCache activitiesCache = new CaffeineCache("activities",
                Caffeine.newBuilder()
                        .maximumSize(100)
                        .build());

        CaffeineCache newsCache = new CaffeineCache("news",
                Caffeine.newBuilder()
                        .maximumSize(100)
                        .build());
        CaffeineCache newsFallbackcache = new CaffeineCache("newsFallback",
                Caffeine.newBuilder()
                        .maximumSize(100)
                        .build());
        CaffeineCache activitiesFallbackcache = new CaffeineCache("activitiesFallback",
                Caffeine.newBuilder()
                        .maximumSize(100)
                        .build());
        cacheManager.setCaches(Arrays.asList(activitiesCache, newsCache, newsFallbackcache, activitiesFallbackcache));
        return cacheManager;
    }
}
