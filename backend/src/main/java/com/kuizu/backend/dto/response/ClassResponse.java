package com.kuizu.backend.dto.response;

import java.io.Serializable;
import com.kuizu.backend.entity.enumeration.ModerationStatus;
import com.kuizu.backend.entity.enumeration.Visibility;

/**
 * DTO for {@link com.kuizu.backend.entity.Class}
 */
public record ClassResponse(Long classId, String ownerUserId, String ownerDisplayName, String className,
        String description, Visibility visibility, ModerationStatus status, String moderationNotes)
        implements Serializable {
}