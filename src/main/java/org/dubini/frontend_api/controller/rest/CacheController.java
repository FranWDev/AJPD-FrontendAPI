package org.dubini.frontend_api.controller.rest;

import org.dubini.frontend_api.service.ActivitiesService;
import org.dubini.frontend_api.service.NewsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import org.dubini.frontend_api.dto.HttpResponse;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class CacheController {

    private final NewsService newsService;
    private final ActivitiesService activitiesService;

    @GetMapping("/api/cache/activities/clear")
    public Mono<ResponseEntity<HttpResponse>> clearActivitiesCache() {
        return activitiesService.warmUpCache()
            .thenReturn(ResponseEntity.ok(new HttpResponse("Activities cache cleared")))
            .onErrorResume(e -> Mono.just(ResponseEntity.status(500)
                    .body(new HttpResponse(e.getMessage()))));
    }

    @GetMapping("/api/cache/news/clear")
    public Mono<ResponseEntity<HttpResponse>> clearNewsCache() {
        return newsService.warmUpCache()
            .thenReturn(ResponseEntity.ok(new HttpResponse("News cache cleared")))
            .onErrorResume(e -> Mono.just(ResponseEntity.status(500)
                    .body(new HttpResponse(e.getMessage()))));
    }
}
