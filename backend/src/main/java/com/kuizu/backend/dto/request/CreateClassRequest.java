package com.kuizu.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.kuizu.backend.entity.enumeration.Visibility;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateClassRequest {
    private String className;
    private String description;
    private Visibility visibility;
    private List<AddClassMaterialRequest> materials;
}
