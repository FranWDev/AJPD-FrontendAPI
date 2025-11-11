package org.dubini.frontend_api.dto;

import lombok.Data;

@Data
public class PublicationDTO {

    public String title;
    public String description;
    public String imageUrl;
    public String publishedAt;

    public EditorJSContentDTO editorContent;

}