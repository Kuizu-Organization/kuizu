package com.kuizu.backend.service;

import com.kuizu.backend.dto.request.ChangePasswordRequest;
import com.kuizu.backend.dto.request.SetPasswordRequest;
import com.kuizu.backend.dto.request.UpdateProfileRequest;
import com.kuizu.backend.dto.response.UserResponse;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionService sessionService;
    private final ModerationService moderationService;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, SessionService sessionService,
            ModerationService moderationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionService = sessionService;
        this.moderationService = moderationService;
    }

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::mapToUserResponse);
    }

    public UserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));
        return mapToUserResponse(user);
    }

    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found"));
        return mapToUserResponse(user);
    }

    public UserResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found"));

        if (request.getDisplayName() != null)
            user.setDisplayName(request.getDisplayName());
        if (request.getBio() != null)
            user.setBio(request.getBio());
        if (request.getProfilePictureUrl() != null)
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        if (request.getLocale() != null)
            user.setLocale(request.getLocale());
        if (request.getTimezone() != null)
            user.setTimezone(request.getTimezone());
        if (request.getPreferences() != null)
            user.setPreferences(request.getPreferences());

        userRepository.save(user);
        return mapToUserResponse(user);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found"));

        if (user.getPasswordHash() == null || user.getPasswordHash().isEmpty()) {
            throw new ApiException("No password set. Please use Set Password instead.");
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new ApiException("Invalid old password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void setPassword(String username, SetPasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found"));

        if (user.getPasswordHash() != null && !user.getPasswordHash().isEmpty()) {
            throw new ApiException("Password already set. Please use Change Password instead.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public UserResponse updateUserStatus(String userId, User.UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));
        user.setStatus(status);
        userRepository.save(user);

        if (status == User.UserStatus.SUSPENDED) {
            sessionService.revokeAllUserSessions(user);
        }

        String action = (status == User.UserStatus.SUSPENDED) ? "SUSPENDED" : "RESTORED";
        moderationService.logUserModeration(userId, action, "Status changed to " + status);

        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateUserRole(String userId, User.UserRole role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));
        user.setRole(role);
        userRepository.save(user);
        moderationService.logUserModeration(userId, "ROLE_UPDATE", "Role changed to " + role);
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .bio(user.getBio())
                .profilePictureUrl(user.getProfilePictureUrl())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .hasPassword(user.getPasswordHash() != null && !user.getPasswordHash().isEmpty())
                .locale(user.getLocale())
                .timezone(user.getTimezone())
                .preferences(user.getPreferences())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
