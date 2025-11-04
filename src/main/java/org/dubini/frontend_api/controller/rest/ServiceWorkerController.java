package org.dubini.frontend_api.controller.rest;

import org.dubini.frontend_api.dto.HttpResponse;
import org.dubini.frontend_api.service.ServiceWorkerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/sw")
@RequiredArgsConstructor
public class ServiceWorkerController {

    private final ServiceWorkerService swService;

    // Obtener la versión actual del SW
    @GetMapping("/version")
    public Mono<ResponseEntity<String>> getSWVersion() {
        return swService.getCurrentVersion().map(version ->
                ResponseEntity.ok(version)
        );
    }

    // Actualizar la versión del SW (backoffice)
    @PostMapping("/update")
    public Mono<ResponseEntity<HttpResponse>> updateSWVersion() {
        return swService.updateVersion()
                .map(newVersion -> ResponseEntity.ok(
                        HttpResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(200)
                                .message(newVersion)
                                .build()
                ));
    }
}
