package com.kuizu.backend.dto.request;

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
    private String profilePictureUrl;
    private String locale;
    private String timezone;
}
