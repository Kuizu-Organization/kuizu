package com.kuizu.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardSetRequest {
    private String title;
    private String description;
    private String visibility;
    private List<FlashcardRequest> flashcards;
}
