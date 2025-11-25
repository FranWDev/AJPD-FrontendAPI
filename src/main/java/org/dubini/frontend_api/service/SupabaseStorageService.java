package org.dubini.frontend_api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.dubini.frontend_api.config.SupabaseStorageProperties;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class SupabaseStorageService {

    private final HttpClient client;
    private final SupabaseStorageProperties props;
    private final ObjectMapper mapper;
    private final String baseUrl;

    public SupabaseStorageService(SupabaseStorageProperties props, ObjectMapper mapper) {
        this.props = props;
        this.mapper = mapper;
        this.client = HttpClient.newHttpClient();
        this.baseUrl = props.getApi() + "/storage/v1/object/" + props.getBucket();
    }

    public void uploadJson(String fileName, Object data) throws IOException, InterruptedException {
        String jsonContent = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(data);

        boolean fileExists = exists(fileName);

        if (fileExists) {
            updateJson(fileName, jsonContent);
        } else {
            createJson(fileName, jsonContent);
        }
    }

    private void createJson(String fileName, String jsonContent) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/" + fileName))
                .header("Authorization", "Bearer " + props.getKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonContent, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new IOException("Error creando archivo en Supabase: " + response.body());
        }
    }

    private void updateJson(String fileName, String jsonContent) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/" + fileName))
                .header("Authorization", "Bearer " + props.getKey())
                .header("Content-Type", "application/json")
                .header("x-upsert", "true") // Header de Supabase para upsert
                .PUT(HttpRequest.BodyPublishers.ofString(jsonContent, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new IOException("Error actualizando archivo en Supabase: " + response.body());
        }
    }

    public <T> T downloadJson(String fileName, Class<T> clazz) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/" + fileName))
                .header("Authorization", "Bearer " + props.getKey())
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 404) {
            return null;
        }

        if (response.statusCode() >= 400) {
            throw new IOException("Error descargando archivo de Supabase: " + response.body());
        }

        return mapper.readValue(response.body(), clazz);
    }

    public <T> T downloadJson(String fileName, TypeReference<T> typeRef) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/" + fileName))
                .header("Authorization", "Bearer " + props.getKey())
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 404) {
            return null;
        }

        if (response.statusCode() >= 400) {
            throw new IOException("Error descargando archivo de Supabase: " + response.body());
        }

        return mapper.readValue(response.body(), typeRef);
    }

    public boolean exists(String fileName) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/" + fileName))
                    .header("Authorization", "Bearer " + props.getKey())
                    .method("HEAD", HttpRequest.BodyPublishers.noBody())
                    .build();

            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
            return response.statusCode() == 200;
        } catch (Exception e) {
            return false;
        }
    }

    public void deleteFile(String fileName) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/" + fileName))
                .header("Authorization", "Bearer " + props.getKey())
                .DELETE()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400 && response.statusCode() != 404) {
            throw new IOException("Error eliminando archivo de Supabase: " + response.body());
        }
    }

    public String[] listFiles() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(props.getApi() + "/storage/v1/object/list/" + props.getBucket()))
                .header("Authorization", "Bearer " + props.getKey())
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new IOException("Error listando archivos: " + response.body());
        }

        return new String[0];
    }
}