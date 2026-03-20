package com.kuizu.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicUserResponse {
    private String username;
    private String displayName;
    private String bio;
    private String profilePictureUrl;
    private String role;
    private String locale;
    private String timezone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
