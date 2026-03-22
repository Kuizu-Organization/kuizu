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
public class UserStatisticResponse {
    private String userId;
    private String username;
    private String displayName;
    private String email;
    private Long totalSets;
    private Long totalCards;
    private Long quizzesTaken;
    private BigDecimal avgScore;
    private LocalDateTime lastActiveAt;
    private LocalDateTime createdAt;
    private String profilePictureUrl;
}
