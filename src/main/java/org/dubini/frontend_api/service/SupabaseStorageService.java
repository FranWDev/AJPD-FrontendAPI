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

    /**
     * Sube o actualiza un archivo JSON al bucket de Supabase
     * Si el archivo existe, lo actualiza (upsert behavior)
     */
    public void uploadJson(String fileName, Object data) throws IOException, InterruptedException {
        String jsonContent = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(data);
        
        // Primero intentar verificar si existe
        boolean fileExists = exists(fileName);
        
        if (fileExists) {
            // Si existe, usar PUT para actualizar
            updateJson(fileName, jsonContent);
        } else {
            // Si no existe, usar POST para crear
            createJson(fileName, jsonContent);
        }
    }

    /**
     * Crea un nuevo archivo JSON en Supabase
     */
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

    /**
     * Actualiza un archivo JSON existente en Supabase
     */
    private void updateJson(String fileName, String jsonContent) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/" + fileName))
                .header("Authorization", "Bearer " + props.getKey())
                .header("Content-Type", "application/json")
                .header("x-upsert", "true")  // Header de Supabase para upsert
                .PUT(HttpRequest.BodyPublishers.ofString(jsonContent, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() >= 400) {
            throw new IOException("Error actualizando archivo en Supabase: " + response.body());
        }
    }

    /**
     * Descarga un archivo JSON desde Supabase
     */
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

    /**
     * Descarga un archivo JSON desde Supabase con TypeReference
     */
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

    /**
     * Verifica si existe un archivo en Supabase
     */
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

    /**
     * Elimina un archivo del bucket de Supabase
     */
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

    /**
     * Lista todos los archivos del bucket (opcional, para debugging)
     */
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

        // Parsear respuesta según formato de Supabase
        return new String[0]; // Implementar según necesidad
    }
}