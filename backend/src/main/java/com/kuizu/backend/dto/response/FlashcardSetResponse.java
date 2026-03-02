package com.kuizu.backend.dto.response;

import com.kuizu.backend.entity.enumeration.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.io.Serializable;

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
    private String status;
    private Integer cardCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
