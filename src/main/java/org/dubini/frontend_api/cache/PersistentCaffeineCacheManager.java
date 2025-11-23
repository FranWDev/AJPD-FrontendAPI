package org.dubini.frontend_api.cache;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.dubini.frontend_api.service.SupabaseStorageService;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import jakarta.annotation.PreDestroy;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Primary
public class PersistentCaffeineCacheManager implements CacheManager {

    private final Map<String, CaffeineCache> caches = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();
    private final SupabaseStorageService storageService;

    public PersistentCaffeineCacheManager(SupabaseStorageService storageService) {
        this.storageService = storageService;
        loadCachesFromSupabase();
    }

    private void loadCachesFromSupabase() {
        // Aquí podrías listar los archivos del bucket si implementas listFiles()
        // Por ahora, las caches se cargarán bajo demanda con getCache()
        System.out.println("CacheManager inicializado con Supabase Storage");
    }

    /**
     * Recarga una cache específica desde Supabase
     */
    public void reloadCache(String name) {
        String fileName = name + ".json";
        
        if (!storageService.exists(fileName)) {
            System.err.println("No existe archivo de cache en Supabase para: " + name);
            return;
        }

        CaffeineCache cache = caches.get(name);
        if (cache == null) {
            cache = createCache(name);
        }

        try {
            Map<Object, Object> data = storageService.downloadJson(
                fileName, 
                new TypeReference<Map<Object, Object>>() {}
            );
            
            if (data != null) {
                cache.getNativeCache().invalidateAll();
                data.forEach(cache.getNativeCache()::put);
                System.out.println("Cache '" + name + "' recargada desde Supabase (" + data.size() + " entradas)");
            }
        } catch (Exception e) {
            System.err.println("Error recargando cache '" + name + "' desde Supabase: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Intenta cargar una cache desde Supabase al acceder por primera vez
     */
    private void tryLoadCache(String name, Cache<Object, Object> nativeCache) {
        String fileName = name + ".json";
        
        try {
            if (storageService.exists(fileName)) {
                Map<Object, Object> data = storageService.downloadJson(
                    fileName, 
                    new TypeReference<Map<Object, Object>>() {}
                );
                
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
        if (cache == null) return;

        String fileName = name + ".json";
        
        try {
            Map<Object, Object> cacheMap = cache.getNativeCache().asMap();
            
            if (cacheMap.isEmpty()) {
                System.out.println("Cache '" + name + "' está vacía, no se guarda");
                return;
            }
            
            storageService.uploadJson(fileName, cacheMap);
            System.out.println("Cache '" + name + "' guardada en Supabase (" + cacheMap.size() + " entradas)");
        } catch (Exception e) {
            System.err.println("Error guardando cache '" + name + "' en Supabase: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public org.springframework.cache.Cache getCache(String name) {
        return caches.computeIfAbsent(name, cacheName -> {
            Cache<Object, Object> nativeCache = Caffeine.newBuilder().build();
            tryLoadCache(cacheName, nativeCache);
            System.out.println("Cache '" + cacheName + "' inicializada");
            return new CaffeineCache(cacheName, nativeCache);
        });
    }

    private CaffeineCache createCache(String name) {
        Cache<Object, Object> cache = Caffeine.newBuilder().build();
        System.out.println("Nueva cache creada: " + name);
        return new CaffeineCache(name, cache);
    }

    @Override
    public Collection<String> getCacheNames() {
        return caches.keySet();
    }

    public boolean isEmpty(String name) {
        CaffeineCache cache = caches.get(name);
        return cache == null || cache.getNativeCache().asMap().isEmpty();
    }
}