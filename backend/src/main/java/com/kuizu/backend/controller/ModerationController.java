package com.kuizu.backend.controller;

import com.kuizu.backend.dto.response.ClassSubmissionResponse;
import com.kuizu.backend.dto.response.FlashcardSetSubmissionResponse;
import com.kuizu.backend.dto.response.ModerationHistoryResponse;
import com.kuizu.backend.entity.Class;
import com.kuizu.backend.service.ModerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
