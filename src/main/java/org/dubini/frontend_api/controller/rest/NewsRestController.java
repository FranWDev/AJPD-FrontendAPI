package org.dubini.frontend_api.controller.rest;

import java.util.List;

import org.dubini.frontend_api.dto.PublicationDTO;
import org.dubini.frontend_api.service.CacheEtagService;
import org.dubini.frontend_api.service.NewsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequiredArgsConstructor
public class NewsRestController {

    private final NewsService newsService;
    private final CacheEtagService cacheEtagService;

    @GetMapping("/api/news")
    public Mono<ResponseEntity<List<PublicationDTO>>> getNews() {
        return newsService.get()
                .map(newsList -> {
                    String etag = cacheEtagService.calculateEtag(newsList);
                    log.debug("Returning {} news items with ETag: {}", newsList.size(), etag);
                    
                    return ResponseEntity.ok()
                            .header("ETag", etag)
                            .body(newsList);
                })
                .onErrorResume(e -> {
                    log.error("Error fetching news: {}", e.getMessage());
                    return Mono.just(ResponseEntity.internalServerError().build());
                });
    }
}