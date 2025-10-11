package org.dubini.frontend_api.service;

import org.dubini.frontend_api.dto.SummaryDTO;
import org.springframework.stereotype.Service;

@Service
public class NewsSerivice {

    public SummaryDTO[] getSummary() {
        return new SummaryDTO[] {
                new SummaryDTO(
                        "Título de la noticia 1",
                        "Descripción breve de la noticia 1",
                        "https://picsum.photos/2010/3060",
                        "https://picsum.photos/2010/3060",
                        "2023-10-01"),
                new SummaryDTO(
                        "Título de la noticia 2",
                        "Descripción breve de la noticia 2",
                        "https://picsum.photos/2006/3400",
                        "https://picsum.photos/2006/3400",
                        "2023-10-02"),
                new SummaryDTO(
                        "Título de la noticia 3",
                        "Descripción breve de la noticia 3",
                        "https://picsum.photos/2001/3020",
                        "https://picsum.photos/2001/3020",
                        "2023-10-03")

        };
    }

    public String getNewsPage(String newsIdentifier) {
        // Aquí iría la lógica para obtener la página de noticias basada en el
        // identificador
        // Por simplicidad, devolvemos una cadena fija
        return "news-page";
    }
}
