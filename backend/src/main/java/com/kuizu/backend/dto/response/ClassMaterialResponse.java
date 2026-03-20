package com.kuizu.backend.dto.response;

import java.io.Serializable;

/**
 * DTO for {@link com.kuizu.backend.entity.ClassMaterial}
 */
public record ClassMaterialResponse(Long materialId, String materialType, Long materialRefId, String materialName) implements Serializable {
}