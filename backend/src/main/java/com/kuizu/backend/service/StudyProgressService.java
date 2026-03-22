package com.kuizu.backend.service;

import com.kuizu.backend.dto.request.QuizSubmitRequest;
import com.kuizu.backend.dto.response.StudyProgressResponse;
import com.kuizu.backend.entity.*;
import com.kuizu.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyProgressService {

    private final StudyProgressRepository studyProgressRepository;
    private final FlashcardRepository flashcardRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final UserRepository userRepository;
    private final StatisticService statisticService;

    @Transactional
    public void recordQuizSubmission(String username, QuizSubmitRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getAnswers() == null || request.getAnswers().isEmpty()) {
            return;
        }

        long correctAnswers = 0;
        FlashcardSet set = null;

        for (QuizSubmitRequest.AnswerItem answer : request.getAnswers()) {
            Flashcard card = flashcardRepository.findById(answer.getCardId())
                    .orElseThrow(() -> new RuntimeException("Card not found: " + answer.getCardId()));

            if (set == null) {
                set = card.getFlashcardSet();
            }

            if (answer.getIsCorrect()) {
                correctAnswers++;
            }

            // Chỉ cập nhật tiến độ học tập trong bảng study_progress
            updateCardProgress(user, card, answer.getIsCorrect());
        }

        if (set != null) {
            java.math.BigDecimal score = java.math.BigDecimal.valueOf((double) correctAnswers / request.getAnswers().size() * 100);
            statisticService.updateUserQuizStats(user, score);
            statisticService.updateSetQuizStats(set, score);
        }
    }

    @Transactional
    public void updateSingleCardProgress(String username, Long cardId, boolean isCorrect) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Flashcard card = flashcardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found: " + cardId));
        
        updateCardProgress(user, card, isCorrect);
    }

    private void updateCardProgress(User user, Flashcard card, boolean isCorrect) {
        StudyProgress progress = studyProgressRepository.findByUserAndFlashcard(user, card)
                .orElse(StudyProgress.builder()
                        .user(user)
                        .flashcard(card)
                        .masteryLevel(0)
                        .streak(0)
                        .resetCount(0)
                        .build());

        if (isCorrect) {
            progress.setMasteryLevel(Math.min(progress.getMasteryLevel() + 1, 5));
            progress.setStreak(progress.getStreak() + 1);
        } else {
            progress.setMasteryLevel(Math.max(progress.getMasteryLevel() - 1, 0));
            progress.setStreak(0);
        }
        progress.setLastStudiedAt(LocalDateTime.now());
        studyProgressRepository.save(progress);
    }

    @Transactional
    public void resetProgress(String username, Long setId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Flashcard set not found"));

        List<Flashcard> cards = flashcardRepository.findByFlashcardSetAndIsDeletedFalseOrderByOrderIndexAsc(set);
        for (Flashcard card : cards) {
            studyProgressRepository.findByUserAndFlashcard(user, card).ifPresent(progress -> {
                progress.setMasteryLevel(0);
                progress.setStreak(0);
                progress.setResetCount(progress.getResetCount() + 1);
                studyProgressRepository.save(progress);
            });
        }
    }
    
    public StudyProgressResponse getSetProgress(String username, Long setId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Flashcard set not found"));

        List<Flashcard> cards = flashcardRepository.findByFlashcardSetAndIsDeletedFalseOrderByOrderIndexAsc(set);
        List<StudyProgressResponse.CardProgressResponse> cardDetails = new ArrayList<>();

        long mastered = 0;
        long learning = 0;
        long newCards = 0;

        for (Flashcard card : cards) {
            StudyProgress progress = studyProgressRepository.findByUserAndFlashcard(user, card).orElse(null);
            if (progress == null) {
                newCards++;
                cardDetails.add(StudyProgressResponse.CardProgressResponse.builder()
                        .cardId(card.getCardId())
                        .term(card.getTerm())
                        .masteryLevel(0)
                        .streak(0)
                        .build());
            } else {
                if (progress.getMasteryLevel() >= 4) {
                    mastered++;
                } else if (progress.getMasteryLevel() > 0) {
                    learning++;
                } else {
                    newCards++;
                }
                cardDetails.add(StudyProgressResponse.CardProgressResponse.builder()
                        .cardId(card.getCardId())
                        .term(card.getTerm())
                        .masteryLevel(progress.getMasteryLevel())
                        .streak(progress.getStreak())
                        .build());
            }
        }

        return StudyProgressResponse.builder()
                .setId(set.getSetId())
                .setTitle(set.getTitle())
                .totalCards(cards.size())
                .masteredCards(mastered)
                .learningCards(learning)
                .newCards(newCards)
                .progressPercentage(cards.isEmpty() ? 0.0 : (double) mastered / cards.size() * 100)
                .cardDetails(cardDetails)
                .build();
    }
}
