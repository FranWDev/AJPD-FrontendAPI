package org.dubini.frontend_api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UpdateStatusResponse {
    private Integer status;
}