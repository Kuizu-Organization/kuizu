package com.kuizu.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddClassMaterialRequest {
    @NotBlank
    private String materialType;

    @NotNull
    private Long materialRefId;
}
