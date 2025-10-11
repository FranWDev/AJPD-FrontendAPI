package org.dubini.frontend_api.controller.web.rest;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.dubini.frontend_api.dto.SummaryDTO;
import org.dubini.frontend_api.service.NewsSerivice;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/api/news")
public class NewsRestController {

    private NewsSerivice newsSerivice;

    public NewsRestController(NewsSerivice newsSerivice) {
        this.newsSerivice = newsSerivice;
    }
    
    @GetMapping("/summary")
    public SummaryDTO[] summary() {
        return newsSerivice.getSummary();
    }

    
}