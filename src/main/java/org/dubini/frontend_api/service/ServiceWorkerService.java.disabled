package org.dubini.frontend_api.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.atomic.AtomicReference;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class ServiceWorkerService {

    private static final String CACHE_DIR = "/tmp/storage/caches";
    private static final String SW_FILE = "sw.json";
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final AtomicReference<String> currentVersion = new AtomicReference<>("v1");

    public ServiceWorkerService() {
        loadVersionFromFile();
    }

    private void loadVersionFromFile() {
        try {
            File cacheDir = new File(CACHE_DIR);
            if (!cacheDir.exists())
                cacheDir.mkdirs();

            Path filePath = Paths.get(CACHE_DIR, SW_FILE);
            if (Files.exists(filePath)) {
                ObjectNode node = (ObjectNode) objectMapper.readTree(filePath.toFile());
                String version = node.get("version").asText();
                currentVersion.set(version);
            } else {
                saveVersionToFile(currentVersion.get());
            }
        } catch (IOException e) {
            System.err.println("Error loading SW version: " + e.getMessage());
        }
    }

    private void saveVersionToFile(String version) {
        try {
            Path filePath = Paths.get(CACHE_DIR, SW_FILE);
            ObjectNode node = objectMapper.createObjectNode();
            node.put("version", version);
            objectMapper.writeValue(filePath.toFile(), node);
        } catch (IOException e) {
            System.err.println("Error saving SW version: " + e.getMessage());
        }
    }

    public Mono<String> getCurrentVersion() {
        return Mono.just(currentVersion.get());
    }

    public Mono<String> updateVersion() {
        String newVersion = "v" + System.currentTimeMillis();
        currentVersion.set(newVersion);
        saveVersionToFile(newVersion);
        return Mono.just(newVersion);
    }
}
