package org.dubini.frontend_api.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CacheTimestampService {
    private static final String CACHE_DIRECTORY = "caches";
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public boolean hasNewsUpdate(String clientLastUpdate, String cacheFileName) {
        try {
            File cacheDir = new File(CACHE_DIRECTORY);
            if (!cacheDir.exists()) {
                cacheDir.mkdirs();
            }

            File cacheFile = new File(cacheDir, cacheFileName);
            if (!cacheFile.exists()) {
                updateTimestamp(cacheFileName);
                return true;
            }

            ObjectNode cacheData = objectMapper.readValue(cacheFile, ObjectNode.class);
            String serverLastUpdate = cacheData.get("lastModified").asText();

            LocalDateTime clientDate = LocalDateTime.parse(clientLastUpdate);
            LocalDateTime serverDate = LocalDateTime.parse(serverLastUpdate);

            return serverDate.isAfter(clientDate);
        } catch (IOException e) {
            log.error("Error checking for news update: {}", e.getMessage());
            return true;
        }
    }

    public void updateTimestamp(String cacheFileName) {
        try {
            File cacheDir = new File(CACHE_DIRECTORY);
            if (!cacheDir.exists()) {
                cacheDir.mkdirs();
            }

            File cacheFile = new File(cacheDir, cacheFileName);
            ObjectNode cacheData = objectMapper.createObjectNode();
            cacheData.put("lastModified", LocalDateTime.now().toString());
            objectMapper.writeValue(cacheFile, cacheData);
        } catch (IOException e) {
            log.error("Error updating cache timestamp: {}", e.getMessage());
        }
    }
}