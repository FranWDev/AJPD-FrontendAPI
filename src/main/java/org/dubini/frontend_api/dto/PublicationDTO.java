package org.dubini.frontend_api.dto;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

import lombok.Data;

@Data
public class PublicationDTO {

    public String title;
    public String description;
    public String imageUrl;
    public String publishedAt;

    public EditorJSContentDTO editorContent;

}