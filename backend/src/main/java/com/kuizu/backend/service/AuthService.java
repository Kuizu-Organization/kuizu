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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private PasswordResetRepository passwordResetRepository;

    @Autowired
    private RateLimiterService rateLimiterService;

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder().withoutPadding();

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletRequest httpServletRequest) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ApiException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already exists");
        }

        User.UserRole userRole = User.UserRole.ROLE_STUDENT;
        if (request.getRole() != null) {
            try {
                userRole = User.UserRole.valueOf(request.getRole());
                if (userRole == User.UserRole.ROLE_ADMIN) {
                    throw new ApiException("Cannot register as Admin");
                }
            } catch (IllegalArgumentException e) {
                throw new ApiException("Invalid role selected");
            }
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .bio(request.getBio())
                .role(userRole)
                .status(User.UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        UserSession session = sessionService.createSession(user, httpServletRequest);

        return AuthResponse.builder()
                .token(session.getSessionToken())
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletRequest httpServletRequest) {
        String identifier = request.getUsernameOrEmail().trim();
        String ip = httpServletRequest.getRemoteAddr();
        String rateLimitKey = identifier + "_" + ip;

        if (!rateLimiterService.isLoginAllowed(rateLimitKey)) {
            throw new ApiException("Too many login attempts. Please try again later.");
        }

        User user = userRepository.findByUsername(identifier)
                .orElseGet(() -> userRepository.findByEmail(identifier)
                        .orElseThrow(() -> {
                            rateLimiterService.registerLoginFailedAttempt(rateLimitKey);
                            return new ApiException("Invalid username or email");
                        }));

        if (user.getStatus() == User.UserStatus.LOCKED) {
            throw new ApiException(
                    "Your account is locked due to multiple failed login attempts. Please contact support.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword()));
            rateLimiterService.resetLoginAttempts(rateLimitKey);
            user.setFailedLoginAttempts(0);
        } catch (Exception e) {
            rateLimiterService.registerLoginFailedAttempt(rateLimitKey);
            int attempts = (user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts()) + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= 5) {
                user.setStatus(User.UserStatus.LOCKED);
            }
            userRepository.save(user);
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
                .role(user.getRole().name())
                .build();
    }

    public void logout(String token) {
        sessionService.revokeSession(token);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        if (!rateLimiterService.isForgotPasswordAllowed(request.getEmail())) {
            throw new ApiException("Too many password reset requests. Please try again in an hour.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("User not found with this email"));

        // Invalidate previous used or active tokens
        passwordResetRepository.findByUserAndUsedAtIsNull(user).forEach(reset -> {
            reset.setUsedAt(LocalDateTime.now()); // Mark as used to invalidate
            passwordResetRepository.save(reset);
        });

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String token = base64Encoder.encodeToString(randomBytes);

        PasswordReset reset = PasswordReset.builder()
                .user(user)
                .resetToken(token)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();

        passwordResetRepository.save(reset);
        rateLimiterService.registerForgotPasswordAttempt(request.getEmail());

        // Log the token for demonstration
        System.out.println("Password reset token for " + user.getEmail() + " is: " + token);
    }

    @Transactional
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
