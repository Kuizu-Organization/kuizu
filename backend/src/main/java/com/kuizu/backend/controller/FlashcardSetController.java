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

    private final FlashcardSetService flashcardSetService;

    public FlashcardSetController(FlashcardSetService flashcardSetService) {
        this.flashcardSetService = flashcardSetService;
    }

    @GetMapping
    public ResponseEntity<List<FlashcardSetResponse>> getAllPublicSets() {
        return ResponseEntity.ok(flashcardSetService.getAllPublicSets());
    }

    @GetMapping("/my")
    public ResponseEntity<List<FlashcardSetResponse>> getMySets(Principal principal) {
        return ResponseEntity.ok(flashcardSetService.getSetsByOwner(principal.getName()));
    }

    @GetMapping("/{setId}")
    public ResponseEntity<FlashcardSetResponse> getSetById(@PathVariable Long setId) {
        return ResponseEntity.ok(flashcardSetService.getSetById(setId));
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

    @PostMapping("/{setId}/re-request")
    public ResponseEntity<FlashcardSetResponse> reRequestReview(@PathVariable Long setId, Principal principal) {
        return ResponseEntity.ok(flashcardSetService.reRequestReview(setId, principal.getName()));
    }
}
