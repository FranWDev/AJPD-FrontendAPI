package org.dubini.frontend_api.client;

import java.util.List;

import org.dubini.frontend_api.config.BackofficeApiUrlProperties;
import org.dubini.frontend_api.dto.PublicationDTO;
import org.dubini.frontend_api.security.JwtProvider;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Component
public class NewsClient {

    private final JwtProvider jwtProvider;
    private final WebClient webClient;
    private final BackofficeApiUrlProperties backofficeApiUrlProperties;

    public NewsClient(WebClient.Builder webClientBuilder, JwtProvider jwtProvider,
            BackofficeApiUrlProperties backofficeApiUrlProperties) {
        this.jwtProvider = jwtProvider;
        this.backofficeApiUrlProperties = backofficeApiUrlProperties;
        String baseUrl = backofficeApiUrlProperties.getUrl();
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();

    }

    public Mono<List<PublicationDTO>> get() {
        System.out.println("Backoffice API URL: " + backofficeApiUrlProperties.getUrl());
        return webClient.get()
                .uri("/api/news")
                .cookie("jwt", jwtProvider.generateToken())
                .retrieve()
                .bodyToFlux(PublicationDTO.class)
                .collectList();
    }
}
