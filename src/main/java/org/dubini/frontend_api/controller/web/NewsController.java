package org.dubini.frontend_api.controller.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.dubini.frontend_api.service.NewsSerivice;

@Controller
@RequestMapping("/noticias")
public class NewsController {

    private NewsSerivice newsService;
    public NewsController(NewsSerivice newsService) {
        this.newsService = newsService;
    }

    @RequestMapping("")
    public String getNewsPage() {
        return "news";
    }

    @RequestMapping("/{newsIdentifier}")
    public String getNewsPage(@PathVariable String newsIdentifier) {
        return newsService.getNewsPage(newsIdentifier);
    }
    
}
