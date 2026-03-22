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
public class ClassStatisticResponse {
    private Long classId;
    private String className;
    private String ownerUsername;
    private String ownerDisplayName;
    private int memberCount;
    private int materialCount;
    private String status;
    private LocalDateTime createdAt;
}
