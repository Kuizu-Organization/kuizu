package com.kuizu.backend.controller;

import com.kuizu.backend.dto.request.ChangePasswordRequest;
import com.kuizu.backend.dto.request.UpdateProfileRequest;
import com.kuizu.backend.dto.response.UserResponse;
import com.kuizu.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@RequestParam String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestParam String username,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(username, request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestParam String username,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(username, request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }
}
