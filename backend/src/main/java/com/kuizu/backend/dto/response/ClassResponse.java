package com.kuizu.backend.dto.response;

import java.io.Serializable;

/**
 * DTO for {@link com.kuizu.backend.entity.Class}
 */
public record ClassResponse(Long classId, String ownerUserId, String ownerDisplayName, String className,
                            String description, String visibility) implements Serializable {
}