package org.dubini.frontend_api.controller.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/actividades")
public class ActivitiesController {

    @RequestMapping("")
    public String getActivitiesPage() {
        return "activities";
    }
    
}
