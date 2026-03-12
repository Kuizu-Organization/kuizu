package com.kuizu.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.kuizu.backend.entity.enumeration.Visibility;

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
    private Visibility visibility;
    private LocalDateTime submittedAt;
}
