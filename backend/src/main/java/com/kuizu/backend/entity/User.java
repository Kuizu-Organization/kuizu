package com.kuizu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(length = 150, unique = true)
    private String username;

    @Column(length = 255, unique = true)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "display_name", length = 150)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "profile_picture_url", columnDefinition = "TEXT")
    private String profilePictureUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserStatus status;

    public enum UserRole {
        ROLE_STUDENT, ROLE_TEACHER, ROLE_ADMIN
    }

    public enum UserStatus {
        ACTIVE, INACTIVE, SUSPENDED, LOCKED
    }

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Builder.Default
    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    @Column(name = "password_updated_at")
    private LocalDateTime passwordUpdatedAt;

    @Column(length = 100)
    private String locale;

    @Column(length = 100)
    private String timezone;

    @Column(columnDefinition = "TEXT")
    private String preferences;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
