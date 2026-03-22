package com.kuizu.backend.dto.response;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for {@link com.kuizu.backend.entity.Class}
 */
import com.kuizu.backend.entity.enumeration.Visibility;
import com.kuizu.backend.entity.enumeration.ModerationStatus;

public record ClassInfoResponse(Long classId, String ownerUserId, String ownerDisplayName, String className,
                                String description, Visibility visibility, ModerationStatus status,
                                List<ClassMaterialResponse> classMaterials,
                                Boolean isMember,
                                Boolean isOwner,
                                List<ClassMemberResponse> members,
                                List<ClassJoinRequestResponse> joinRequests) implements Serializable {
}