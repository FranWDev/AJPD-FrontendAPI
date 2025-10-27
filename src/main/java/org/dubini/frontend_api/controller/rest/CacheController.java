package org.dubini.frontend_api.controller.rest;

import org.dubini.frontend_api.service.ActivitiesService;
import org.dubini.frontend_api.service.NewsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import org.dubini.frontend_api.dto.HttpResponse;


@RestController
@RequiredArgsConstructor
public class CacheController {

    private final NewsService newsService;
    private final ActivitiesService activitiesService;

    @GetMapping("/api/cache/activities/clear")
    public ResponseEntity<HttpResponse> clearActivitiesCache() {
        try {
            activitiesService.clear();
            return ResponseEntity.ok(new HttpResponse("Activities cache cleared"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HttpResponse(e.getMessage()));
        }
    }

    @GetMapping("/api/cache/news/clear")
    public ResponseEntity<HttpResponse> clearNewsCache() {
        try {
            newsService.clear();
            return ResponseEntity.ok(new HttpResponse("News cache cleared"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HttpResponse(e.getMessage()));
        }
    }
   
}
