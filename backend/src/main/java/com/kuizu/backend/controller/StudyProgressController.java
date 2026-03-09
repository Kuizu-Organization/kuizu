package com.kuizu.backend.controller;

import com.kuizu.backend.dto.request.QuizSubmitRequest;
import com.kuizu.backend.dto.response.StudyProgressResponse;
import com.kuizu.backend.service.StudyProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/study")
@RequiredArgsConstructor
public class StudyProgressController {

    private final StudyProgressService studyProgressService;

    @PostMapping("/quiz/submit")
    public ResponseEntity<Void> submitQuiz(Principal principal, @RequestBody QuizSubmitRequest request) {
        studyProgressService.recordQuizSubmission(principal.getName(), request);
        return ResponseEntity.ok().build();
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
}
