package com.kuizu.backend.controller;

import com.kuizu.backend.dto.request.QuizSubmitRequest;
import com.kuizu.backend.dto.request.StudySessionRequest;
import com.kuizu.backend.dto.response.StudyProgressResponse;
import com.kuizu.backend.service.StudyProgressService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/study")
@RequiredArgsConstructor
public class StudyProgressController {

    private final StudyProgressService studyProgressService;

    @PostMapping("/quiz/submit")
    public ResponseEntity<Void> submitQuiz(Principal principal, @Valid @RequestBody QuizSubmitRequest request) {
        studyProgressService.recordQuizSubmission(principal.getName(), request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/quiz/initialize")
    public ResponseEntity<java.util.List<com.kuizu.backend.dto.response.FlashcardResponse>> initializeQuiz(
            Principal principal, @Valid @RequestBody com.kuizu.backend.dto.request.QuizInitializeRequest request) {
        return ResponseEntity.ok(studyProgressService.prepareQuizCards(principal.getName(), request));
    }

    @GetMapping("/progress/{setId}")
    public ResponseEntity<StudyProgressResponse> getProgress(Principal principal, @PathVariable Long setId) {
        return ResponseEntity.ok(studyProgressService.getSetProgress(principal.getName(), setId));
    }

    @PostMapping("/progress/reset/{setId}")
    public ResponseEntity<Void> resetProgress(Principal principal, @PathVariable Long setId) {
        studyProgressService.resetProgress(principal.getName(), setId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/study/update")
    public ResponseEntity<Void> updateStudySession(Principal principal, @RequestBody StudySessionRequest request) {
        studyProgressService.updateSingleCardProgress(principal.getName(), request.getCardId(), request.getIsCorrect());
        return ResponseEntity.ok().build();
    }
}
