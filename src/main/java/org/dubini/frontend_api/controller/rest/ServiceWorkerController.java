package org.dubini.frontend_api.controller.rest;

import org.dubini.frontend_api.dto.HttpResponse;
import org.dubini.frontend_api.service.ServiceWorkerService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/service-workers")
@RequiredArgsConstructor
public class ServiceWorkerController {

        private final ServiceWorkerService swService;

        @GetMapping("/version")
        public Mono<ResponseEntity<String>> getSWVersion() {
                return swService.getCurrentVersion()
                                .map(version -> ResponseEntity.ok()
                                                .eTag(version)
                                                .cacheControl(CacheControl.noStore())
                                                .body(version));
        }

        @RequestMapping(value = "/version", method = RequestMethod.HEAD)
        public Mono<ResponseEntity<Object>> headSWVersion() {
                return swService.getCurrentVersion()
                                .doOnError(err -> err.printStackTrace()) // DEBUG
                                .map(version -> ResponseEntity.ok()
                                                .eTag(version)
                                                .cacheControl(CacheControl.noStore())
                                                .build())
                                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
        }

        @PostMapping("/update")
        public Mono<ResponseEntity<HttpResponse>> updateSWVersion() {
                return swService.updateVersion()
                                .map(newVersion -> ResponseEntity.ok(
                                                HttpResponse.builder()
                                                                .timestamp(LocalDateTime.now())
                                                                .status(200)
                                                                .message(newVersion)
                                                                .build()));
        }
}
