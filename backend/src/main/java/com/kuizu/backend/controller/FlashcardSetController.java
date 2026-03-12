package com.kuizu.backend.controller;

import com.kuizu.backend.dto.request.CreateFlashcardSetRequest;
import com.kuizu.backend.service.FlashcardSetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/flashcard-sets")
@RequiredArgsConstructor
public class FlashcardSetController {
    private final FlashcardSetService flashcardSetService;

    @PostMapping
    public ResponseEntity<?> createFlashcardSet(@RequestBody CreateFlashcardSetRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(flashcardSetService.createFlashcardSet(request, principal.getName()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyFlashcardSets(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(flashcardSetService.getUserSets(principal.getName()));
    }

    @GetMapping("/{setId}")
    public ResponseEntity<?> getFlashcardSet(@PathVariable Long setId) {
        return ResponseEntity.ok(flashcardSetService.getFlashcardSet(setId));
    }
}
