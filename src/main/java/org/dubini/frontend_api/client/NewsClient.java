package org.dubini.frontend_api.client;

import java.util.List;

import org.dubini.frontend_api.dto.PublicationDTO;
import org.dubini.frontend_api.security.JwtProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Component
public class NewsClient {

    private final JwtProvider jwtProvider;
    private final WebClient webClient;

    public NewsClient(WebClient.Builder webClientBuilder,
                            @Value("${backofficeAPI.url}") String baseUrl) {
        this.jwtProvider = new JwtProvider();
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    public Mono<List<PublicationDTO>> get() {
        return webClient.get()
            .uri("/api/news")
            .cookie("jwt", jwtProvider.generateToken())
            .retrieve()
            .bodyToFlux(PublicationDTO.class)
            .collectList();
    }
}
