package com.kuizu.backend.dto.request;

import jakarta.validation.constraints.Pattern;
import org.hibernate.validator.constraints.URL;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String displayName;
    private String bio;

    @URL(message = "Invalid profile picture URL")
    private String profilePictureUrl;

    @Pattern(regexp = "^[A-Za-z\\s,\\-().]{2,100}$", message = "Invalid location format")
    private String locale;

    @Pattern(regexp = "^[A-Za-z0-9_\\-\\+/]{2,100}$", message = "Invalid timezone format")
    private String timezone;

    private String preferences;
}
