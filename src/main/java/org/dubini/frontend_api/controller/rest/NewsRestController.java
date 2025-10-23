package org.dubini.frontend_api.controller.rest;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;
import reactor.core.publisher.Mono;

import java.util.List;

import org.dubini.frontend_api.dto.PublicationDTO;
import org.dubini.frontend_api.service.NewsService;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@AllArgsConstructor
@RequestMapping("/api/news")
public class NewsRestController {

    private NewsService newsSerivice;
    
    @GetMapping
    public Mono<List<PublicationDTO>> get() {
        return newsSerivice.get();
    }
    
}