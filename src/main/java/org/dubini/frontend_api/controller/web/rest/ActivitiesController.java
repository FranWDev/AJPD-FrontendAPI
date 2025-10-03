package org.dubini.frontend_api.controller.web.rest;

import org.dubini.frontend_api.dto.SummaryDTO;
import org.dubini.frontend_api.service.ActivitiesSerivice;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/activities")
public class ActivitiesController {

    public ActivitiesSerivice activitiesSerivice;
    public ActivitiesController(ActivitiesSerivice activitiesSerivice) {
        this.activitiesSerivice = activitiesSerivice;
    }
    
    @GetMapping("/summary")
    public SummaryDTO[] summary() {
        return activitiesSerivice.getSummary();
    }
}