package com.kuizu.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StudyProgressResponse {
    private Long setId;
    private String setTitle;
    private Integer totalCards;
    private Long masteredCards;
    private Long learningCards;
    private Long newCards;
    private Double progressPercentage;
    private List<CardProgressResponse> cardDetails;

    @Data
    @Builder
    public static class CardProgressResponse {
        private Long cardId;
        private String term;
        private Integer masteryLevel;
        private Integer streak;
    }
}
