package com.kuizu.backend.dto.response;

import java.io.Serializable;

/**
 * DTO for {@link com.kuizu.backend.entity.Class}
 */
import com.kuizu.backend.entity.enumeration.Visibility;
import com.kuizu.backend.entity.enumeration.ModerationStatus;

public record ClassResponse(Long classId, String ownerUserId, String ownerDisplayName, String className,
                            String description, Visibility visibility, ModerationStatus status) implements Serializable {
}