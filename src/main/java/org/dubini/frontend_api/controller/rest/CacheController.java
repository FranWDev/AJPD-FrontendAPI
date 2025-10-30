package org.dubini.frontend_api.controller.rest;

import org.dubini.frontend_api.dto.HttpResponse;
import org.dubini.frontend_api.service.ActivitiesService;
import org.dubini.frontend_api.service.FeaturedService;
import org.dubini.frontend_api.service.NewsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
public class CacheController {

    private final NewsService newsService;
    private final ActivitiesService activitiesService;
    private final FeaturedService featuredService;

    @GetMapping("/api/cache/activities/clear")
    public Mono<ResponseEntity<HttpResponse>> clearActivitiesCache() {
        return activitiesService.warmUpCache()
                .then(featuredService.warmUpCache())
                .thenReturn(ResponseEntity.ok(HttpResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(HttpStatus.OK.value())
                        .message("Activities and Featured cache cleared")
                        .build()))
                .onErrorResume(e -> handleError(e));
    }

    @GetMapping("/api/cache/news/clear")
    public Mono<ResponseEntity<HttpResponse>> clearNewsCache() {
        return newsService.warmUpCache()
                .then(featuredService.warmUpCache())
                .thenReturn(ResponseEntity.ok(HttpResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(HttpStatus.OK.value())
                        .message("News and Featured cache cleared")
                        .build()))
                .onErrorResume(e -> handleError(e));
    }

    @GetMapping("/api/cache/featured/clear")
    public Mono<ResponseEntity<HttpResponse>> clearFeaturedCache() {
        return featuredService.warmUpCache()
                .thenReturn(ResponseEntity.ok(HttpResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(HttpStatus.OK.value())
                        .message("Featured cache cleared")
                        .build()))
                .onErrorResume(e -> handleError(e));
    }

    private Mono<ResponseEntity<HttpResponse>> handleError(Throwable e) {
        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(HttpResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .error("Internal Server Error")
                        .message(e.getMessage())
                        .build()));
    }
}
