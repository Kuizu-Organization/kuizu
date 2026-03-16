package com.kuizu.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateFolderRequest {
    @NotBlank(message = "Folder name is required")
    private String name;
    private String description;
    private String visibility; // PUBLIC or PRIVATE
}
