package com.kuizu.backend.controller;

import com.kuizu.backend.service.MockDataSeederService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dev")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DevController {

    private final MockDataSeederService mockDataSeederService;

    @PostMapping("/seed-data")
    public ResponseEntity<String> seedMockData() {
        mockDataSeederService.seedMockData();
        return ResponseEntity.ok("Data seeded successfully");
    }
}
