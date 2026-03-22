package com.kuizu.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardSetStatisticResponse {
    private Long setId;
    private String title;
    private String ownerUsername;
    private String ownerDisplayName;
    private Long viewCount;
    private Long quizCount;
    private BigDecimal retentionRate;
    private LocalDateTime lastViewedAt;
}
