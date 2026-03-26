package com.kuizu.backend.controller;

import com.kuizu.backend.dto.request.FlashcardRequest;
import com.kuizu.backend.dto.response.FlashcardResponse;
import com.kuizu.backend.service.FlashcardService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    private final FlashcardService flashcardService;

    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @GetMapping("/set/{setId}")
    public ResponseEntity<List<FlashcardResponse>> getFlashcardsBySetId(@PathVariable Long setId) {
        return ResponseEntity.ok(flashcardService.getFlashcardsBySetId(setId));
    }

    @GetMapping("/{cardId}")
    public ResponseEntity<FlashcardResponse> getFlashcardById(@PathVariable Long cardId) {
        return ResponseEntity.ok(flashcardService.getFlashcardById(cardId));
    }

    @PostMapping("/set/{setId}")
    public ResponseEntity<FlashcardResponse> createFlashcard(@PathVariable Long setId, Principal principal, @Valid @RequestBody FlashcardRequest request) {
        return ResponseEntity.ok(flashcardService.createFlashcard(setId, principal.getName(), request));
    }

    @PutMapping("/{cardId}")
    public ResponseEntity<FlashcardResponse> updateFlashcard(@PathVariable Long cardId, Principal principal, @Valid @RequestBody FlashcardRequest request) {
        return ResponseEntity.ok(flashcardService.updateFlashcard(cardId, principal.getName(), request));
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteFlashcard(@PathVariable Long cardId, Principal principal) {
        flashcardService.deleteFlashcard(cardId, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
