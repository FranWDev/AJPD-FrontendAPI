package org.dubini.frontend_api.dto;

import java.util.List;

import lombok.Data;

@Data
public class EditorJSContentDTO {
    private long time;
    private List<EditorJSBlock> blocks;
    private String version;

}