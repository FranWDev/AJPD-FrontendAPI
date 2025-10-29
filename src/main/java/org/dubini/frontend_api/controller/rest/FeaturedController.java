package org.dubini.frontend_api.controller.rest;

import java.util.List;

import org.dubini.frontend_api.dto.PublicationDTO;
import org.dubini.frontend_api.service.FeaturedService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/featured")
public class FeaturedController {

    private final FeaturedService featuredService;
    
    @GetMapping
    public Mono<List<PublicationDTO>> get() {
        return featuredService.get();
    }
}