package com.kuizu.backend.dto.response;

import java.io.Serializable;
import java.time.LocalDateTime;

public record ClassJoinRequestResponse(
        Long requestId,
        String userId,
        String displayName,
        String message,
        String status,
        LocalDateTime requestedAt
) implements Serializable {
}
