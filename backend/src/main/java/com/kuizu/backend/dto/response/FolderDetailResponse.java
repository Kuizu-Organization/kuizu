package com.kuizu.backend.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FolderDetailResponse {
    private Long folderId;
    private String name;
    private String description;
    private String visibility;
    private String ownerDisplayName;
    private String ownerUsername;
    private LocalDateTime createdAt;
    private List<CategorySummary> categories;
    private List<FlashcardSetSummary> sets;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategorySummary {
        private String name;
        private List<FlashcardSetSummary> sets;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FlashcardSetSummary {
        private Long setId;
        private String category;
        private String title;
        private String description;
        private long termCount;
        private String ownerDisplayName;
        private String ownerUsername;
        private LocalDateTime createdAt;
        private List<FlashcardItem> flashcards;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FlashcardItem {
        private Long cardId;
        private String term;
        private String definition;
        private Integer orderIndex;
    }
}
