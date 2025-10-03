package org.dubini.frontend_api.dto;


public class SummaryDTO {
    
    public String title;
    public String description;
    public String url;
    public String imageUrl;
    public String publishedAt;

    public SummaryDTO(String title, String description, String url, String imageUrl, String publishedAt) {
        this.title = title;
        this.description = description;
        this.url = url;
        this.imageUrl = imageUrl;
        this.publishedAt = publishedAt;
    }
    public SummaryDTO() {
    }
    
}
