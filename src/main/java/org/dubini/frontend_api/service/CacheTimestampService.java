package org.dubini.frontend_api.service;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CacheTimestampService {

    private static final String CACHE_FILE = "lastModified.json";
    private final SupabaseStorageService storageService;
    private final ObjectMapper objectMapper;

    public boolean hasNewsUpdate(String clientLastUpdate) {
        try {
            // Verificar si existe el archivo en Supabase
            if (!storageService.exists(CACHE_FILE)) {
                log.info("Cache file not found in Supabase, creating a new one...");
                updateTimestamp();
                return true;
            }

            // Descargar el archivo desde Supabase
            ObjectNode cacheData = storageService.downloadJson(CACHE_FILE, ObjectNode.class);
            
            if (cacheData == null || cacheData.get("lastModified") == null) {
                log.warn("Cache file is missing 'lastModified', updating...");
                updateTimestamp();
                return true;
            }

            String serverLastUpdate = cacheData.get("lastModified").asText();
            Instant clientDate = Instant.parse(clientLastUpdate).truncatedTo(ChronoUnit.MILLIS);
            Instant serverDate = Instant.parse(serverLastUpdate).truncatedTo(ChronoUnit.MILLIS);

            return clientDate.isBefore(serverDate);

        } catch (IOException | InterruptedException e) {
            log.error("Error checking for news update: {}", e.getMessage());
            return true;
        } catch (Exception e) {
            log.error("Unexpected error while checking news update: {}", e.getMessage());
            return true;
        }
    }

    public void updateTimestamp() {
        try {
            ObjectNode cacheData = objectMapper.createObjectNode();
            Instant now = Instant.now().truncatedTo(ChronoUnit.MILLIS);
            cacheData.put("lastModified", now.toString());

            // Subir el archivo a Supabase
            storageService.uploadJson(CACHE_FILE, cacheData);

            log.info("Cache timestamp updated in Supabase: {}", cacheData.get("lastModified").asText());
        } catch (IOException | InterruptedException e) {
            log.error("Error updating cache timestamp in Supabase: {}", e.getMessage());
        }
    }
}