package com.kuizu.backend.service;

import com.kuizu.backend.dto.request.ForgotPasswordRequest;
import com.kuizu.backend.dto.request.LoginRequest;
import com.kuizu.backend.dto.request.RegisterRequest;
import com.kuizu.backend.dto.request.ResetPasswordRequest;
import com.kuizu.backend.dto.request.VerifyOtpRequest;
import com.kuizu.backend.dto.response.AuthResponse;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.entity.UserSession;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

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
    private RateLimiterService rateLimiterService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    private static final Random random = new Random();

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
                .status(User.UserStatus.INACTIVE)
                .build();

        user = userRepository.save(user);

        checkOtpRateLimit(user.getEmail());

        String otp = String.format("%06d", random.nextInt(1000000));
        otpService.storeOtp(user.getEmail(), otp, "REGISTER");

        rateLimiterService.registerOtpRequest(user.getEmail());
        emailService.sendOtpEmail(user.getEmail(), user.getUsername(), otp, "Registration");

        return AuthResponse.builder()
                .requireOtp(true)
                .build();
    }

    @Transactional
    public AuthResponse verifyRegistrationOtp(VerifyOtpRequest request, HttpServletRequest httpServletRequest) {
        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtpCode(), "REGISTER");
        if (!isValid) {
            throw new ApiException("Invalid or expired OTP code");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("User not found"));

        if (user.getStatus() != User.UserStatus.INACTIVE) {
            throw new ApiException("User is already active");
        }

        user.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(user);

        UserSession session = sessionService.createSession(user, httpServletRequest);

        return AuthResponse.builder()
                .token(session.getSessionToken())
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .requireOtp(false)
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

        if (user.getStatus() == User.UserStatus.SUSPENDED) {
            throw new ApiException("Your account is suspended. Please contact support.");
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
                .requireOtp(false)
                .build();
    }

    public void logout(String token) {
        sessionService.revokeSession(token);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        if (!rateLimiterService.isForgotPasswordAllowed(request.getEmail())) {
            throw new ApiException("Too many password reset requests. Please try again in 15 minutes.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("User not found with this email"));

        otpService.invalidateOtp(request.getEmail(), "PASSWORD_RESET");

        checkOtpRateLimit(request.getEmail());

        String otp = String.format("%06d", random.nextInt(1000000));
        otpService.storeOtp(user.getEmail(), otp, "PASSWORD_RESET");

        rateLimiterService.registerForgotPasswordAttempt(request.getEmail());
        rateLimiterService.registerOtpRequest(request.getEmail());

        emailService.sendOtpEmail(user.getEmail(), user.getUsername(), otp, "Password Reset");
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtpCode(), "PASSWORD_RESET");
        if (!isValid) {
            throw new ApiException("Invalid or expired OTP code");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void resendRegistrationOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found with this email"));

        if (user.getStatus() != User.UserStatus.INACTIVE) {
            throw new ApiException("User is already active or cannot resend code");
        }

        otpService.invalidateOtp(email, "REGISTER");

        checkOtpRateLimit(email);

        String otp = String.format("%06d", random.nextInt(1000000));
        otpService.storeOtp(email, otp, "REGISTER");

        rateLimiterService.registerOtpRequest(email);
        emailService.sendOtpEmail(email, user.getUsername(), otp, "Registration");
    }

    private void checkOtpRateLimit(String email) {
        String status = rateLimiterService.getOtpRateLimitStatus(email);
        if ("BLOCKED".equals(status)) {
            throw new ApiException("Too many OTP requests. Please try again after 15 minutes.");
        }
        if ("COOLDOWN".equals(status)) {
            throw new ApiException("Please wait 60 seconds before requesting another code.");
        }
    }
}
