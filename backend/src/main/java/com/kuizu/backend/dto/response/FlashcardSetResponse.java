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
public class FlashcardSetResponse {
    private Long setId;
    private String ownerId;
    private String ownerDisplayName;
    private String title;
    private String description;
    private String visibility;
    private String category;
    private String status;
    private String moderationNotes;
    private Integer cardCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
