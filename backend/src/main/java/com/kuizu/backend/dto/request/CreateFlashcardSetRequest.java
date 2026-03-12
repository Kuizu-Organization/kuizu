package com.kuizu.backend.dto.request;

import com.kuizu.backend.entity.enumeration.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFlashcardSetRequest {
    private String title;
    private String description;
    private Visibility visibility;
    private List<FlashcardItemRequest> flashcards;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlashcardItemRequest {
        private String term;
        private String definition;
        private String imageUrl;
        private Integer orderIndex;
    }
}
