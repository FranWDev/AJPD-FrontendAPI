package org.dubini.frontend_api.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:4200",
                "https://proyectodubini.org",
                "https://api.proyectodubini.org",
                "https://oficina.proyectodubini.org",
                "https://proyectodubini.vercel.app",
            "https://proyectodubini.onrender.com"));
        configuration.setAllowedMethods(List.of("GET", "POST", "HEAD", "OPTIONS"));
        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Cache-Control",
                "Content-Type",
                "If-None-Match",
                "Origin",
                "X-Requested-With"));
        configuration.setExposedHeaders(List.of("ETag", "If-None-Match"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}