package org.dubini.frontend_api.controller.rest;

import org.dubini.frontend_api.dto.HttpResponse;
import org.dubini.frontend_api.service.CacheEtagService;
import org.dubini.frontend_api.service.NewsService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Slf4j
@RestController
@RequiredArgsConstructor
public class CacheController {

    private final NewsService newsService;
    private final CacheEtagService cacheEtagService;

    @GetMapping("/api/news/last")
    public ResponseEntity<Void> checkNewsUpdateGet(
            @RequestHeader(value = "If-None-Match", required = false) String clientEtag) {

        String serverEtag = newsService.getCurrentEtag();

        if (serverEtag == null) {
            log.warn("Server ETag is null, returning 200 OK");
            return ResponseEntity.ok().build();
        }

        boolean hasChanged = cacheEtagService.hasChanged(clientEtag, serverEtag);

        log.info("ETag comparison - Client: {}, Server: {}, Changed: {}",
                clientEtag, serverEtag, hasChanged);

        HttpHeaders headers = new HttpHeaders();
        headers.setETag(serverEtag);

        if (hasChanged) {
            return ResponseEntity.ok().headers(headers).build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).headers(headers).build();
        }
    }

    @RequestMapping(value = "/api/news/last", method = RequestMethod.HEAD)
    public ResponseEntity<Void> checkNewsUpdateHead(
            @RequestHeader(value = "If-None-Match", required = false) String clientEtag) {

        String serverEtag = newsService.getCurrentEtag();

        if (serverEtag == null) {
            log.warn("Server ETag is null, returning 200 OK");
            return ResponseEntity.ok().build();
        }

        boolean hasChanged = cacheEtagService.hasChanged(clientEtag, serverEtag);

        log.info("ETag comparison (HEAD) - Client: {}, Server: {}, Changed: {}",
                clientEtag, serverEtag, hasChanged);

        HttpHeaders headers = new HttpHeaders();
        headers.setETag(serverEtag);

        if (hasChanged) {
            return ResponseEntity.ok().headers(headers).build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).headers(headers).build();
        }
    }

    @GetMapping("/api/cache/news/clear")
    public Mono<ResponseEntity<HttpResponse>> clearNewsCache() {
        return newsService.warmUpCache()
                .thenReturn(ResponseEntity.ok(HttpResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(HttpStatus.OK.value())
                        .message("News cache cleared and refreshed")
                        .build()))
                .onErrorResume(e -> handleError(e));
    }

    private Mono<ResponseEntity<HttpResponse>> handleError(Throwable e) {
        log.error("Error clearing news cache: {}", e.getMessage(), e);
        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(HttpResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .error("Internal Server Error")
                        .message(e.getMessage())
                        .build()));
    }
}