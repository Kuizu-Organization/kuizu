package com.kuizu.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerationHistoryResponse {
    private Long modId;
    private String moderatorUsername;
    private String moderatorDisplayName;
    private String entityType;
    private Long entityId;
    private String action;
    private String notes;
    private LocalDateTime createdAt;
}
