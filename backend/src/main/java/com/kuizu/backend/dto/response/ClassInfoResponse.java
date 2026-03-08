package com.kuizu.backend.dto.response;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for {@link com.kuizu.backend.entity.Class}
 */
public record ClassInfoResponse(Long classId, String ownerUserId, String ownerDisplayName, String className,
                                String description,
                                List<ClassMaterialResponse> classMaterials) implements Serializable {
}