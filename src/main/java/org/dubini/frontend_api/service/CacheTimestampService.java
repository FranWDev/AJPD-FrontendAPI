package org.dubini.frontend_api.service;

import java.io.File;
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

    private static final String CACHE_DIRECTORY = "/tmp/storage/caches";
    private static final String CACHE_FILE = "lastModified.json";
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public boolean hasNewsUpdate(String clientLastUpdate) {
        try {
            File cacheDir = new File(CACHE_DIRECTORY);
            if (!cacheDir.exists()) {
                cacheDir.mkdirs();
            }

            File cacheFile = new File(cacheDir, CACHE_FILE);
            if (!cacheFile.exists()) {
                log.info("Cache file not found, creating a new one...");
                updateTimestamp();
                return true;
            }

            ObjectNode cacheData = objectMapper.readValue(cacheFile, ObjectNode.class);
            if (cacheData.get("lastModified") == null) {
                log.warn("Cache file is missing 'lastModified', updating...");
                updateTimestamp();
                return true;
            }

            String serverLastUpdate = cacheData.get("lastModified").asText();
            Instant clientDate = Instant.parse(clientLastUpdate).truncatedTo(ChronoUnit.MILLIS);
            Instant serverDate = Instant.parse(serverLastUpdate).truncatedTo(ChronoUnit.MILLIS);

            return clientDate.isBefore(serverDate);

        } catch (IOException e) {
            log.error("Error checking for news update: {}", e.getMessage());
            return true;
        } catch (Exception e) {
            log.error("Unexpected error while checking news update: {}", e.getMessage());
            return true;
        }
    }

    public void updateTimestamp() {
        try {
            File cacheDir = new File(CACHE_DIRECTORY);
            if (!cacheDir.exists())
                cacheDir.mkdirs();

            File cacheFile = new File(cacheDir, CACHE_FILE);
            ObjectNode cacheData = objectMapper.createObjectNode();

            Instant now = Instant.now().truncatedTo(ChronoUnit.MILLIS);
            cacheData.put("lastModified", now.toString());
            objectMapper.writeValue(cacheFile, cacheData);

            log.info("Cache timestamp updated: {}", cacheData.get("lastModified").asText());
        } catch (IOException e) {
            log.error("Error updating cache timestamp: {}", e.getMessage());
        }
    }
}
