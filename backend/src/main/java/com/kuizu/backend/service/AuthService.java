package com.kuizu.backend.service;

import com.kuizu.backend.dto.request.ForgotPasswordRequest;
import com.kuizu.backend.dto.request.LoginRequest;
import com.kuizu.backend.dto.request.RegisterRequest;
import com.kuizu.backend.dto.request.ResetPasswordRequest;
import com.kuizu.backend.dto.response.AuthResponse;
import com.kuizu.backend.entity.PasswordReset;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.entity.UserSession;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.repository.PasswordResetRepository;
import com.kuizu.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SessionService sessionService;



    @Autowired
    private PasswordResetRepository passwordResetRepository;

    @Autowired
    private HttpServletRequest httpServletRequest;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ApiException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .role(User.UserRole.ROLE_USER)
                .status(User.UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        UserSession session = sessionService.createSession(user, httpServletRequest);

        return AuthResponse.builder()
                .token(session.getSessionToken())
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail().trim();
        User user = userRepository.findByUsername(identifier)
                .orElseGet(() -> userRepository.findByEmail(identifier)
                        .orElseThrow(() -> new ApiException("Invalid username or email")));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException("Invalid password");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        UserSession session = sessionService.createSession(user, httpServletRequest);

        return AuthResponse.builder()
                .token(session.getSessionToken())
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    public void logout(String token) {
        sessionService.revokeSession(token);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("User not found with this email"));

        String token = java.util.UUID.randomUUID().toString();
        PasswordReset reset = PasswordReset.builder()
                .user(user)
                .resetToken(token)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();

        passwordResetRepository.save(reset);

        // Log the token for demonstration
        System.out.println("Password reset token for " + user.getEmail() + " is: " + token);
    }

    public void resetPassword(ResetPasswordRequest request) {
        PasswordReset reset = passwordResetRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new ApiException("Invalid or expired reset token"));

        if (reset.getUsedAt() != null || reset.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("Invalid or expired reset token");
        }

        User user = reset.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        reset.setUsedAt(LocalDateTime.now());
        passwordResetRepository.save(reset);
    }
}
