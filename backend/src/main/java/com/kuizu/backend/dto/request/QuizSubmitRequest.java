package com.kuizu.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitRequest {
    @NotNull(message = "Set ID cannot be null")
    private Long setId;

    @NotEmpty(message = "Answers list cannot be empty")
    @Valid
    private List<AnswerItem> answers;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerItem {
        @NotNull(message = "Card ID cannot be null")
        private Long cardId;

        @NotNull(message = "isCorrect status cannot be null")
        private Boolean isCorrect;
    }
}
