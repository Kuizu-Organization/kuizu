package com.kuizu.backend.controller;

import com.kuizu.backend.dto.request.ModerationRequest;
import com.kuizu.backend.dto.response.ClassSubmissionResponse;
import com.kuizu.backend.dto.response.FlashcardSetSubmissionResponse;
import com.kuizu.backend.dto.response.ModerationHistoryResponse;
import com.kuizu.backend.service.ModerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moderation")
@PreAuthorize("hasRole('ADMIN')")
public class ModerationController {

    private final ModerationService moderationService;

    @Autowired
    public ModerationController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @GetMapping("/submissions/flashcards")
    public ResponseEntity<List<FlashcardSetSubmissionResponse>> getPendingFlashcardSets() {
        return ResponseEntity.ok(moderationService.getPendingFlashcardSets());
    }

    @GetMapping("/submissions/classes")
    public ResponseEntity<List<ClassSubmissionResponse>> getPendingClasses() {
        return ResponseEntity.ok(moderationService.getPendingClasses());
    }

    @GetMapping("/history")
    public ResponseEntity<List<ModerationHistoryResponse>> getModerationHistory() {
        return ResponseEntity.ok(moderationService.getModerationHistory());
    }

    @PostMapping("/flashcards/{setId}/approve")
    public ResponseEntity<Void> approveFlashcardSet(@PathVariable Long setId, @RequestBody ModerationRequest request) {
        moderationService.approveFlashcardSet(setId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/flashcards/{setId}/reject")
    public ResponseEntity<Void> rejectFlashcardSet(@PathVariable Long setId, @RequestBody ModerationRequest request) {
        moderationService.rejectFlashcardSet(setId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/classes/{classId}/approve")
    public ResponseEntity<Void> approveClass(@PathVariable Long classId, @RequestBody ModerationRequest request) {
        moderationService.approveClass(classId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/classes/{classId}/reject")
    public ResponseEntity<Void> rejectClass(@PathVariable Long classId, @RequestBody ModerationRequest request) {
        moderationService.rejectClass(classId, request);
        return ResponseEntity.ok().build();
    }
}
