package com.kuizu.backend.service;

import com.kuizu.backend.dto.request.ChangePasswordRequest;
import com.kuizu.backend.dto.request.UpdateProfileRequest;
import com.kuizu.backend.dto.response.UserResponse;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
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

        userRepository.save(user);
        return mapToUserResponse(user);
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new ApiException("Invalid old password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
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
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
