package com.kuizu.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Username can only contain letters, numbers, dots, underscores, and hyphens")
    @Pattern(regexp = "^(?!^\\d+$).+$", message = "Username cannot be only numbers")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 255, message = "Email must be at most 255 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!]).*$", message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@#$%^&+=!)")
    private String password;

    @Size(max = 150, message = "Display name must be at most 150 characters")
    private String displayName;

    @Size(max = 500, message = "Bio must be at most 500 characters")
    private String bio;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(ROLE_STUDENT|ROLE_TEACHER)$", message = "Role must be either ROLE_STUDENT or ROLE_TEACHER")
    private String role;
}
