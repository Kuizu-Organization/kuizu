package com.kuizu.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateFolderRequest {
    @NotBlank(message = "Folder name is required")
    private String name;
    private String description;
    private String visibility; // PUBLIC or PRIVATE
    private List<Long> setIds; // Optional flashcard set IDs to add
}
