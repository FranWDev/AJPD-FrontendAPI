package org.dubini.frontend_api.cache;

import com.fasterxml.jackson.core.type.TypeReference;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.dubini.frontend_api.service.SupabaseStorageService;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.stereotype.Component;
import jakarta.annotation.PreDestroy;
import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PersistentCaffeineCacheManager implements CacheManager {

    private final Map<String, CaffeineCache> caches = new ConcurrentHashMap<>();
    private final SupabaseStorageService storageService;

    public PersistentCaffeineCacheManager(SupabaseStorageService storageService) {
        this.storageService = storageService;
    }

    /* Crea todas las caches vacías y dispara carga asíncrona */
    @PostConstruct
    public void warmUpCachesAsync() {
        List<String> cacheNames = List.of("news");
        for (String name : cacheNames) {
            CaffeineCache cache = (CaffeineCache) getCache(name);
            CompletableFuture.runAsync(() -> tryLoadCache(name, cache.getNativeCache()));
        }
    }

    private void tryLoadCache(String name, Cache<Object, Object> nativeCache) {
        String fileName = name + ".json";
        try {
            if (storageService.exists(fileName)) {
                Map<Object, Object> data = storageService.downloadJson(
                        fileName, new TypeReference<Map<Object, Object>>() {
                        });
                if (data != null && !data.isEmpty()) {
                    data.forEach(nativeCache::put);
                    System.out.println("Cache '" + name + "' cargada desde Supabase (" + data.size() + " entradas)");
                }
            }
        } catch (Exception e) {
            System.err.println("Error cargando cache '" + name + "' desde Supabase: " + e.getMessage());
        }
    }

    @PreDestroy
    public void saveCaches() {
        System.out.println("Guardando caches en Supabase...");
        caches.keySet().forEach(this::saveCache);
    }

    public void saveCache(String name) {
        CaffeineCache cache = caches.get(name);
        if (cache == null)
            return;

        String fileName = name + ".json";
        try {
            Map<Object, Object> cacheMap = cache.getNativeCache().asMap();
            if (cacheMap.isEmpty())
                return;
            storageService.uploadJson(fileName, cacheMap);
            System.out.println("Cache '" + name + "' guardada en Supabase (" + cacheMap.size() + " entradas)");
        } catch (Exception e) {
            System.err.println("Error guardando cache '" + name + "' en Supabase: " + e.getMessage());
        }
    }

    @Override
    public org.springframework.cache.Cache getCache(String name) {
        return caches.computeIfAbsent(name, cacheName -> {
            Cache<Object, Object> nativeCache = Caffeine.newBuilder().build();
            return new CaffeineCache(cacheName, nativeCache);
        });
    }

    @Override
    public Collection<String> getCacheNames() {
        return caches.keySet();
    }

    public boolean isEmpty(String name) {
        CaffeineCache cache = caches.get(name);
        return cache == null || cache.getNativeCache().asMap().isEmpty();
    }

    public void reloadCache(String name) {
        CaffeineCache cache = (CaffeineCache) getCache(name);
        CompletableFuture.runAsync(() -> tryLoadCache(name, cache.getNativeCache()));
    }

}
