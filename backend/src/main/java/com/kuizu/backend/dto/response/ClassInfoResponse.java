package com.kuizu.backend.dto.response;

import java.io.Serializable;
import java.util.List;
import com.kuizu.backend.entity.enumeration.ModerationStatus;
import com.kuizu.backend.entity.enumeration.Visibility;

/**
 * DTO for {@link com.kuizu.backend.entity.Class}
 */
public record ClassInfoResponse(Long classId, String ownerUserId, String ownerDisplayName, String className,
                                String description, Visibility visibility, ModerationStatus status, String moderationNotes,
                                List<ClassMaterialResponse> classMaterials,
                                Boolean isMember,
                                Boolean isOwner,
                                List<ClassMemberResponse> members,
                                List<ClassJoinRequestResponse> joinRequests) implements Serializable {
}