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
public class FlashcardSetSubmissionResponse {
    private Long setId;
    private String ownerUsername;
    private String ownerDisplayName;
    private String title;
    private String description;
    private String visibility;
    private LocalDateTime submittedAt;
}
