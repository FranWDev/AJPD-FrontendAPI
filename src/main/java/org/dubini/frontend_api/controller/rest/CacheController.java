package org.dubini.frontend_api.controller.rest;

import org.dubini.frontend_api.service.ActivitiesService;
import org.dubini.frontend_api.service.NewsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import org.dubini.frontend_api.dto.HttpResponse;
import reactor.core.publisher.Mono;
import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
public class CacheController {

    private final NewsService newsService;
    private final ActivitiesService activitiesService;

    @GetMapping("/api/cache/activities/clear")
    public Mono<ResponseEntity<HttpResponse>> clearActivitiesCache() {
        return activitiesService.warmUpCache()
        .thenReturn(ResponseEntity.ok(HttpResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.OK.value())
            .message("Activities cache cleared")
            .build()))
        .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(HttpResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message(e.getMessage())
                .build())));
    }

    @GetMapping("/api/cache/news/clear")
    public Mono<ResponseEntity<HttpResponse>> clearNewsCache() {
        return newsService.warmUpCache()
        .thenReturn(ResponseEntity.ok(HttpResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.OK.value())
            .message("News cache cleared")
            .build()))
        .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(HttpResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message(e.getMessage())
                .build())));
    }
}
