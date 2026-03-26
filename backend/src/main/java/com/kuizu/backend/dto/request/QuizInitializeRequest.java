package com.kuizu.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizInitializeRequest {
    @NotNull(message = "Set ID is required")
    private Long setId;

    @NotNull(message = "Please specify the number of questions.")
    @Min(value = 1, message = "Number of questions must be at least 1.")
    @Max(value = 100, message = "Maximum allowed questions per quiz is 100.")
    private Integer numQuestions;

    @NotEmpty(message = "At least one mode must be selected")
    private List<String> activeModes;

    private Boolean starredOnly = false;
    
    // Optional: answerDirection if we want backend to handle it, but it's purely UI
}
