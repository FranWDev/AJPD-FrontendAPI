package org.dubini.frontend_api.client;

import java.util.List;

import org.dubini.frontend_api.dto.PublicationDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@FeignClient(name = "activitiesClient", url = "${backofficeAPI.url}")
@Component
public class ActivitiesClient {

    private final WebClient webClient;

    public ActivitiesClient(WebClient.Builder webClientBuilder,
                            @Value("${backofficeAPI.url}") String baseUrl) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    public Mono<List<PublicationDTO>> get() {
        return webClient.get()
            .uri("/api/activities")
            .retrieve()
            .bodyToFlux(PublicationDTO.class)
            .collectList();
    }
}
