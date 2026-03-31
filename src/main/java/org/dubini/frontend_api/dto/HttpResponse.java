package org.dubini.frontend_api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HttpResponse {
    private LocalDateTime timestamp;
    private int status;
    private String message;
    private String error;
    private String path;
    private Object data;
}
