package org.dubini.frontend_api.controller.rest;

import org.dubini.frontend_api.dto.HttpResponse;
import org.dubini.frontend_api.service.CacheTimestampService;
import org.dubini.frontend_api.service.NewsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
public class CacheController {

        private final NewsService newsService;
        private final CacheTimestampService cacheTimestampService;
        // private final ActivitiesService activitiesService;
        // private final FeaturedService featuredService;

        @GetMapping("/api/news/last")
        public ResponseEntity<Void> checkNewsUpdateGet(
                        @RequestHeader("If-Modified-Since") String clientLastUpdate) {

                boolean hasUpdate = cacheTimestampService.hasNewsUpdate(clientLastUpdate);
                return ResponseEntity.status(hasUpdate ? HttpStatus.OK : HttpStatus.NOT_MODIFIED).build();
        }

        @RequestMapping(value = "/api/news/last", method = RequestMethod.HEAD)
        public ResponseEntity<Void> checkNewsUpdateHead(
                        @RequestHeader("If-Modified-Since") String clientLastUpdate) {

                boolean hasUpdate = cacheTimestampService.hasNewsUpdate(clientLastUpdate);
                return ResponseEntity.status(hasUpdate ? HttpStatus.OK : HttpStatus.NOT_MODIFIED).build();
        }

        /*
         * @GetMapping("/api/cache/activities/clear")
         * public Mono<ResponseEntity<HttpResponse>> clearActivitiesCache() {
         * return activitiesService.warmUpCache()
         * .then(featuredService.warmUpCache())
         * .thenReturn(ResponseEntity.ok(HttpResponse.builder()
         * .timestamp(LocalDateTime.now())
         * .status(HttpStatus.OK.value())
         * .message("Activities and Featured cache cleared")
         * .build()))
         * .onErrorResume(e -> handleError(e));
         * }
         */

        @GetMapping("/api/cache/news/clear")
        public Mono<ResponseEntity<HttpResponse>> clearNewsCache() {
                // Actualizar timestamp y limpiar caché
                cacheTimestampService.updateTimestamp();
                return newsService.warmUpCache()
                                .thenReturn(ResponseEntity.ok(HttpResponse.builder()
                                                .timestamp(LocalDateTime.now())
                                                .status(HttpStatus.OK.value())
                                                .message("News and Featured cache cleared")
                                                .build()))
                                .onErrorResume(e -> handleError(e));
        }

        /*
         * @GetMapping("/api/cache/featured/clear")
         * public Mono<ResponseEntity<HttpResponse>> clearFeaturedCache() {
         * return featuredService.warmUpCache()
         * .thenReturn(ResponseEntity.ok(HttpResponse.builder()
         * .timestamp(LocalDateTime.now())
         * .status(HttpStatus.OK.value())
         * .message("Featured cache cleared")
         * .build()))
         * .onErrorResume(e -> handleError(e));
         * }
         */

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
