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

        if (request.getSetId() == null) {
            throw new RuntimeException("Set ID is required");
        }

        FlashcardSet set = flashcardSetRepository.findById(request.getSetId())
                .orElseThrow(() -> new RuntimeException("Flashcard set not found"));

        if (request.getAnswers() == null || request.getAnswers().isEmpty()) {
            return;
        }

        List<QuizSubmitRequest.AnswerItem> answers = request.getAnswers();
        if (answers == null || answers.isEmpty()) return; // Added null check for answers

        // Tính toán tỷ lệ chính xác (score) của cả bài Quiz
        long correctCount = answers.stream().filter(QuizSubmitRequest.AnswerItem::getIsCorrect).count();
        double quizScore = (double) correctCount / answers.size();

        // Update statistics for the quiz submission
        java.math.BigDecimal finalScore = java.math.BigDecimal.valueOf(quizScore * 100);
        statisticService.updateUserQuizStats(user, finalScore);
        statisticService.updateSetQuizStats(set, finalScore);

        for (QuizSubmitRequest.AnswerItem answer : answers) {
            Flashcard card = flashcardRepository.findById(answer.getCardId())
                    .orElseThrow(() -> new RuntimeException("Card not found: " + answer.getCardId()));

            // SECURITY: Check if card belongs to the specified set
            if (!card.getFlashcardSet().getSetId().equals(set.getSetId())) {
                throw new RuntimeException("Card " + card.getCardId() + " does not belong to set " + set.getSetId());
            }

            updateCardProgressWithBonus(user, card, answer.getIsCorrect(), quizScore);
        }
    }

    private void updateCardProgressWithBonus(User user, Flashcard card, boolean isCorrect, double quizScore) {
        StudyProgress progress = studyProgressRepository.findByUserAndFlashcard(user, card)
                .orElse(StudyProgress.builder()
                        .user(user)
                        .flashcard(card)
                        .masteryLevel(0)
                        .streak(0)
                        .resetCount(0)
                        .build());

        if (isCorrect) {
            // Logic Mastery Bonus dựa theo điểm số bài Quiz
            if (quizScore == 1.0) {
                // Đạt 100%: Lên thẳng mức Thành thạo cao nhất
                progress.setMasteryLevel(5);
            } else if (quizScore >= 0.8) {
                // Đạt từ 80% trở lên: Đảm bảo thẻ ở mức Mastered (ít nhất là 4)
                progress.setMasteryLevel(Math.max(progress.getMasteryLevel(), 4));
            } else {
                // Dưới 80%: Chỉ tăng 1 cấp độ như bình thường
                progress.setMasteryLevel(Math.min(progress.getMasteryLevel() + 1, 5));
            }
            progress.setStreak(progress.getStreak() + 1);
        } else {
            // Trả lời sai: Trừ điểm và phá vỡ chuỗi trả lời đúng
            progress.setMasteryLevel(Math.max(progress.getMasteryLevel() - 1, 0));
            progress.setStreak(0);
        }
        
        progress.setLastStudiedAt(LocalDateTime.now());
        studyProgressRepository.save(progress);
    }

    @Transactional
    public void updateSingleCardProgress(String username, Long cardId, boolean isCorrect) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Flashcard card = flashcardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found: " + cardId));
        
        // Học từng thẻ đơn lẻ (như trong mode Study) không áp dụng Bonus bài Quiz
        updateCardProgressWithBonus(user, card, isCorrect, 0.0);
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
        long totalMasteryPoints = 0;

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
                totalMasteryPoints += progress.getMasteryLevel();
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

        double progressPercentage = 0.0;
        if (!cards.isEmpty()) {
            // Mỗi thẻ có tối đa 5 điểm thông thạo
            long maxPossiblePoints = (long) cards.size() * 5;
            progressPercentage = (double) totalMasteryPoints / maxPossiblePoints * 100;
        }

        return StudyProgressResponse.builder()
                .setId(set.getSetId())
                .setTitle(set.getTitle())
                .totalCards(cards.size())
                .masteredCards(mastered)
                .learningCards(learning)
                .newCards(newCards)
                .progressPercentage(progressPercentage)
                .cardDetails(cardDetails)
                .build();
    }

    @Transactional(readOnly = true)
    public List<com.kuizu.backend.dto.response.FlashcardResponse> prepareQuizCards(String username, com.kuizu.backend.dto.request.QuizInitializeRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FlashcardSet set = flashcardSetRepository.findById(request.getSetId())
                .orElseThrow(() -> new RuntimeException("Flashcard set not found"));

        // Verify set exists and matches total cards or filter
        List<Flashcard> allCards = flashcardRepository.findByFlashcardSetAndIsDeletedFalseOrderByOrderIndexAsc(set);
        
        if (allCards.isEmpty()) {
            throw new RuntimeException("No cards found in this set to take a quiz.");
        }

        // Tự động giới hạn số câu hỏi tối đa bằng với số thẻ thực tế đang có
        int requestedCount = Math.min(request.getNumQuestions(), allCards.size());
        
        // Randomize the pool
        java.util.Collections.shuffle(allCards);
        
        // Take a sublist
        List<Flashcard> selection = allCards.subList(0, requestedCount);
        
        // Convert to response DTOs
        List<com.kuizu.backend.dto.response.FlashcardResponse> response = new ArrayList<>();
        for (Flashcard card : selection) {
            response.add(com.kuizu.backend.dto.response.FlashcardResponse.builder()
                    .cardId(card.getCardId())
                    .setId(card.getFlashcardSet().getSetId())
                    .term(card.getTerm())
                    .definition(card.getDefinition())
                    .orderIndex(card.getOrderIndex())
                    .build());
        }
        
        return response;
    }
}
