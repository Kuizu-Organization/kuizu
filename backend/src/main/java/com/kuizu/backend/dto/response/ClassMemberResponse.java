package com.kuizu.backend.dto.response;

import java.io.Serializable;
import java.time.LocalDateTime;

public record ClassMemberResponse(
        String userId,
        String displayName,
        String role,
        String profilePictureUrl,
        LocalDateTime joinedAt
) implements Serializable {
}
