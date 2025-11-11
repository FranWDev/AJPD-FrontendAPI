package org.dubini.frontend_api.cache;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import jakarta.annotation.PreDestroy;
import java.io.File;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Primary
public class PersistentCaffeineCacheManager implements CacheManager {

    private final Map<String, CaffeineCache> caches = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();
    private final File baseDir = new File("/tmp/storage/caches");

    public PersistentCaffeineCacheManager() {
        if (!baseDir.exists())
            baseDir.mkdirs();
        loadCachesFromDisk();
    }

    private void loadCachesFromDisk() {
        File[] files = baseDir.listFiles((dir, name) -> name.endsWith(".json"));
        if (files != null) {
            for (File file : files) {
                String name = file.getName().replace(".json", "");
                Cache<Object, Object> nativeCache = Caffeine.newBuilder().build();
                try {
                    Map<Object, Object> data = mapper.readValue(file, new TypeReference<>() {
                    });
                    data.forEach(nativeCache::put);
                    System.out.println("Cache '" + name + "' cargada desde disco (" + data.size() + " entradas)");
                } catch (Exception e) {
                    System.err.println("Error cargando cache '" + name + "': " + e.getMessage());
                }
                caches.put(name, new CaffeineCache(name, nativeCache));
            }
        }
    }

    /**
     * Recarga una cache específica desde disco
     */
    public void reloadCache(String name) {
        File file = new File(baseDir, name + ".json");
        if (!file.exists()) {
            System.err.println("No existe archivo de cache en disco para: " + name);
            return;
        }

        CaffeineCache cache = caches.get(name);
        if (cache == null) {
            cache = createCache(name);
        }

        try {
            Map<Object, Object> data = mapper.readValue(file, new TypeReference<>() {
            });
            cache.getNativeCache().invalidateAll();
            data.forEach(cache.getNativeCache()::put);
            System.out.println("Cache '" + name + "' recargada desde disco (" + data.size() + " entradas)");
        } catch (Exception e) {
            System.err.println("Error recargando cache '" + name + "' desde disco: " + e.getMessage());
        }
    }

    @PreDestroy
    public void saveCaches() {
        caches.keySet().forEach(this::saveCache);
    }

    public void saveCache(String name) {
        CaffeineCache cache = caches.get(name);
        if (cache == null)
            return;

        File file = new File(baseDir, name + ".json");
        try {
            Map<Object, Object> cacheMap = cache.getNativeCache().asMap();
            if (cacheMap.isEmpty()) {
                System.out.println("Cache '" + name + "' está vacía, no se guarda");
                return;
            }
            mapper.writerWithDefaultPrettyPrinter().writeValue(file, cacheMap);
            System.out.println("Cache '" + name + "' guardada en disco (" + cacheMap.size() + " entradas)");
        } catch (Exception e) {
            System.err.println("Error guardando cache '" + name + "': " + e.getMessage());
        }
    }

    @Override
    public org.springframework.cache.Cache getCache(String name) {
        return caches.computeIfAbsent(name, this::createCache);
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