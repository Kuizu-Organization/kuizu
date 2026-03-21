package com.kuizu.backend.controller;

import com.kuizu.backend.dto.request.ChangePasswordRequest;
import com.kuizu.backend.dto.request.SetPasswordRequest;
import com.kuizu.backend.dto.request.UpdateProfileRequest;
import com.kuizu.backend.dto.response.UserResponse;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.service.UserService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) User.UserRole role,
            @RequestParam(required = false) User.UserStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(search, role, status, pageable));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Principal principal) {
        return ResponseEntity.ok(userService.getUserByUsername(principal.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            Principal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getName(), request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/set-password")
    public ResponseEntity<Map<String, String>> setPassword(
            Principal principal,
            @Valid @RequestBody SetPasswordRequest request) {
        userService.setPassword(principal.getName(), request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password set successfully");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable String userId,
            @RequestParam User.UserStatus status) {
        return ResponseEntity.ok(userService.updateUserStatus(userId, status));
    }

    @PatchMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable String userId,
            @RequestParam User.UserRole role) {
        return ResponseEntity.ok(userService.updateUserRole(userId, role));
    }}

    
    
        
    

