package com.kuizu.backend.controller;

import com.kuizu.backend.dto.response.FlashcardSetResponse;
import com.kuizu.backend.service.SavedSetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saved-sets")
@RequiredArgsConstructor
public class SavedSetController {

    private final SavedSetService savedSetService;

    @PostMapping("/{setId}")
    public ResponseEntity<?> saveSet(@PathVariable Long setId, Authentication authentication) {
        String username = authentication.getName();
        savedSetService.saveSet(setId, username);
        return ResponseEntity.ok(Map.of("message", "Set saved successfully"));
    }

    @DeleteMapping("/{setId}")
    public ResponseEntity<?> unsaveSet(@PathVariable Long setId, Authentication authentication) {
        String username = authentication.getName();
        savedSetService.unsaveSet(setId, username);
        return ResponseEntity.ok(Map.of("message", "Set unsaved successfully"));
    }

    @GetMapping
    public ResponseEntity<List<FlashcardSetResponse>> getSavedSets(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(savedSetService.getSavedSets(username));
    }

    @GetMapping("/{setId}/status")
    public ResponseEntity<?> getSavedStatus(@PathVariable Long setId, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(Map.of("isSaved", false));
        }
        String username = authentication.getName();
        boolean isSaved = savedSetService.isSetSaved(setId, username);
        return ResponseEntity.ok(Map.of("isSaved", isSaved));
    }
}
