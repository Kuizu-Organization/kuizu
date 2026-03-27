package com.kuizu.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardRequest {
    private String term;
    private String definition;

    @Min(value = 0, message = "Order index cannot be less than 0.")
    @Max(value = 10000, message = "Order index cannot exceed 10000.")
    private Integer orderIndex;
}
