package org.dubini.frontend_api.client;

import java.util.List;

import org.dubini.frontend_api.dto.PublicationDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@FeignClient(name = "newsClient", url = "${backofficeAPI.url}")
@Component
public class NewsClient {

    private final WebClient webClient;

    public NewsClient(WebClient.Builder webClientBuilder,
                            @Value("${backofficeAPI.url}") String baseUrl) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    public Mono<List<PublicationDTO>> get() {
        return webClient.get()
            .uri("/api/news")
            .retrieve()
            .bodyToFlux(PublicationDTO.class)
            .collectList();
    }
}
