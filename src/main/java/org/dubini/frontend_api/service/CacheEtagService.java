package org.dubini.frontend_api.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CacheEtagService {

    private final ObjectMapper objectMapper;
    
    // Caché en memoria simple para ETags (no necesita persistencia)
    private final Map<Integer, String> etagCache = new ConcurrentHashMap<>();

    /**
     * Calcula el ETag basado en el contenido del objeto
     * Usa SHA-256 para generar un hash del contenido serializado
     * El resultado se cachea en memoria para evitar recalcular constantemente
     */
    public String calculateEtag(Object content) {
        int contentHash = content.hashCode();
        
        String cachedEtag = etagCache.get(contentHash);
        if (cachedEtag != null) {
            log.debug("ETag retrieved from memory cache: {}", cachedEtag);
            return cachedEtag;
        }
        
        try {
            String jsonContent = objectMapper.writeValueAsString(content);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(jsonContent.getBytes(StandardCharsets.UTF_8));

            String fullHash = HexFormat.of().formatHex(hash);
            String etag = "\"" + fullHash.substring(0, 16) + "\"";

            etagCache.put(contentHash, etag);
            log.debug("ETag calculated and cached: {}", etag);
            return etag;
            
        } catch (JsonProcessingException e) {
            log.error("Error serializing content for ETag calculation: {}", e.getMessage());
            return "\"" + System.currentTimeMillis() + "\"";
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 algorithm not available: {}", e.getMessage());
            return "\"" + System.currentTimeMillis() + "\"";
        }
    }

    /**
     * Compara si dos ETags son diferentes
     */
    public boolean hasChanged(String clientEtag, String serverEtag) {
        if (clientEtag == null || serverEtag == null) {
            return true;
        }
        
        String normalizedClient = normalizeEtag(clientEtag);
        String normalizedServer = normalizeEtag(serverEtag);
        
        return !normalizedClient.equals(normalizedServer);
    }

    /**
     * Normaliza un ETag removiendo comillas y espacios
     */
    private String normalizeEtag(String etag) {
        if (etag == null) {
            return "";
        }
        return etag.trim().replaceAll("^\"|\"$", "");
    }
    
    /**
     * Limpia la caché de ETags (útil para testing o cuando se reinicia la caché de noticias)
     */
    public void clearEtagCache() {
        etagCache.clear();
        log.info("ETag cache cleared");
    }
}