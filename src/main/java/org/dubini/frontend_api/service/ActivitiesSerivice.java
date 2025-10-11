package org.dubini.frontend_api.service;

import org.dubini.frontend_api.dto.SummaryDTO;
import org.springframework.stereotype.Service;

@Service
public class ActivitiesSerivice {

    public SummaryDTO[] getSummary() {
        return new SummaryDTO[] {
                new SummaryDTO(
                        "Titulo de la actividad 1",
                        "Descripción breve de la actividad 1",
                        "https://example.com/news1",
                        "https://example.com/image1.jpg",
                        "2023-10-01"),
                new SummaryDTO(
                        "TTitulo de la actividad 2",
                        "Descripción breve de la actividad 2",
                        "https://example.com/news2",
                        "https://example.com/image2.jpg",
                        "2023-10-02"),
                new SummaryDTO(
                        "TTitulo de la actividad 3",
                        "Descripción breve de la actividad 3",
                        "https://example.com/news3",
                        "https://example.com/image3.jpg",
                        "2023-10-03")

        };
    }

    public String getActivityPage(String activityIdentifier) {
        // Aquí iría la lógica para obtener la página de actividades basada en el
        // identificador
        // Por simplicidad, devolvemos una cadena fija
        return "activity-page";
    }
}
