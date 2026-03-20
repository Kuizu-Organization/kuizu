package com.kuizu.backend.controller;

import com.kuizu.backend.dto.request.FlashcardSetRequest;
import com.kuizu.backend.dto.response.FlashcardSetResponse;
import com.kuizu.backend.service.FlashcardSetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/flashcard-sets")
public class FlashcardSetController {

    @Autowired
    private FlashcardSetService flashcardSetService;

    @GetMapping
    public ResponseEntity<List<FlashcardSetResponse>> getAllPublicSets(
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "4") int limit) {
        if ("suggested".equals(type)) {
            return ResponseEntity.ok(flashcardSetService.getSuggestedSets(limit));
        }
        return ResponseEntity.ok(flashcardSetService.getAllPublicSets());
    }

    @GetMapping("/me")
    public ResponseEntity<List<FlashcardSetResponse>> getMySets(Principal principal) {
        return ResponseEntity.ok(flashcardSetService.getSetsByOwner(principal.getName()));
    }

    @GetMapping("/{setId}")
    public ResponseEntity<FlashcardSetResponse> getFlashcardSet(@PathVariable Long setId, Principal principal) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(flashcardSetService.getFlashcardSet(setId, username));
    }

    @GetMapping("/search")
    public ResponseEntity<List<FlashcardSetResponse>> searchSets(@RequestParam String query) {
        return ResponseEntity.ok(flashcardSetService.findSetsByTitle(query));
    }

    @PostMapping
    public ResponseEntity<FlashcardSetResponse> createSet(Principal principal, @Valid @RequestBody FlashcardSetRequest request) {
        return ResponseEntity.ok(flashcardSetService.createSet(principal.getName(), request));
    }
    @PutMapping("/{setId}")
    public ResponseEntity<FlashcardSetResponse> updateSet(@PathVariable Long setId, Principal principal, @Valid @RequestBody FlashcardSetRequest request) {
        return ResponseEntity.ok(flashcardSetService.updateSet(setId, principal.getName(), request));
    }
    @DeleteMapping("/{setId}")
    public ResponseEntity<Void> deleteSet(@PathVariable Long setId, Principal principal) {
        flashcardSetService.deleteSet(setId, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
