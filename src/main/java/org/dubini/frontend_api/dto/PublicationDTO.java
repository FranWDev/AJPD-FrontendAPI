package org.dubini.frontend_api.dto;

import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class PublicationDTO {

    public String title;
    public String description;
    public String imageUrl;
    public String publishedAt;

    public EditorJSContentDTO editorContent;

}