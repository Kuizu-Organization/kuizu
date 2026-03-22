package com.kuizu.backend.controller;

import com.kuizu.backend.dto.request.ForgotPasswordRequest;
import com.kuizu.backend.dto.request.GoogleLoginRequest;
import com.kuizu.backend.dto.request.LoginRequest;
import com.kuizu.backend.dto.request.RegisterRequest;
import com.kuizu.backend.dto.request.ResetPasswordRequest;
import com.kuizu.backend.dto.request.VerifyOtpRequest;
import com.kuizu.backend.dto.response.AuthResponse;
import com.kuizu.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.register(request, httpRequest));
    }

    @PostMapping("/verify-registration")
    public ResponseEntity<AuthResponse> verifyRegistration(@Valid @RequestBody VerifyOtpRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.verifyRegistrationOtp(request, httpRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.login(request, httpRequest));
    }

    @PostMapping("/resend-registration-otp")
    public ResponseEntity<Map<String, String>> resendRegistrationOtp(@RequestBody Map<String, String> request) {
        authService.resendRegistrationOtp(request.get("email"));
        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration code resent successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.googleLogin(request, httpRequest));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset link sent to your email");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, String> response = new HashMap<>();
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token);
            response.put("message", "Logged out successfully");
            return ResponseEntity.ok(response);
        }
        response.put("error", "Unauthorized");
        response.put("message", "Invalid or missing authorization token");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
}
