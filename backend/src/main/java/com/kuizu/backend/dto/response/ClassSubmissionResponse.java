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
public class ClassSubmissionResponse {
    private Long classId;
    private String ownerUsername;
    private String ownerDisplayName;
    private String className;
    private String description;
    private String joinCode;
    private String visibility;
    private LocalDateTime submittedAt;
}
