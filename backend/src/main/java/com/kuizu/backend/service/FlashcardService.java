package com.kuizu.backend.service;

import com.kuizu.backend.dto.request.FlashcardRequest;
import com.kuizu.backend.dto.response.FlashcardResponse;
import com.kuizu.backend.entity.Flashcard;
import com.kuizu.backend.entity.FlashcardSet;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.repository.FlashcardRepository;
import com.kuizu.backend.repository.FlashcardSetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FlashcardService {

    @Autowired
    private FlashcardRepository flashcardRepository;

    @Autowired
    private FlashcardSetRepository flashcardSetRepository;

    public List<FlashcardResponse> getFlashcardsBySetId(Long setId) {
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .filter(s -> s.getIsDeleted() == null || !s.getIsDeleted())
                .orElseThrow(() -> new ApiException("Flashcard set not found"));

        return flashcardRepository.findByFlashcardSetAndIsDeletedFalseOrderByOrderIndexAsc(set)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FlashcardResponse getFlashcardById(Long cardId) {
        Flashcard card = flashcardRepository.findById(cardId)
                .filter(c -> c.getIsDeleted() == null || !c.getIsDeleted())
                .orElseThrow(() -> new ApiException("Flashcard not found"));
        return mapToResponse(card);
    }

    @Transactional
    public FlashcardResponse createFlashcard(Long setId, String username, FlashcardRequest request) {
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .filter(s -> s.getIsDeleted() == null || !s.getIsDeleted())
                .orElseThrow(() -> new ApiException("Flashcard set not found"));

        if (!set.getOwner().getUsername().equals(username)) {
            throw new ApiException("You do not have permission to add cards to this set");
        }

        Flashcard card = Flashcard.builder()
                .flashcardSet(set)
                .term(request.getTerm())
                .definition(request.getDefinition())
                .orderIndex(request.getOrderIndex())
                .isDeleted(false)
                .createdBy(username)
                .build();

        card = flashcardRepository.save(card);
        return mapToResponse(card);
    }

    @Transactional
    public FlashcardResponse updateFlashcard(Long cardId, String username, FlashcardRequest request) {
        Flashcard card = flashcardRepository.findById(cardId)
                .filter(c -> c.getIsDeleted() == null || !c.getIsDeleted())
                .orElseThrow(() -> new ApiException("Flashcard not found"));

        if (!card.getFlashcardSet().getOwner().getUsername().equals(username)) {
            throw new ApiException("You do not have permission to update this flashcard");
        }

        if (request.getTerm() != null) card.setTerm(request.getTerm());
        if (request.getDefinition() != null) card.setDefinition(request.getDefinition());
        if (request.getOrderIndex() != null) card.setOrderIndex(request.getOrderIndex());

        card = flashcardRepository.save(card);
        return mapToResponse(card);
    }

    @Transactional
    public void deleteFlashcard(Long cardId, String username) {
        Flashcard card = flashcardRepository.findById(cardId)
                .filter(c -> c.getIsDeleted() == null || !c.getIsDeleted())
                .orElseThrow(() -> new ApiException("Flashcard not found"));

        if (!card.getFlashcardSet().getOwner().getUsername().equals(username)) {
            throw new ApiException("You do not have permission to delete this flashcard");
        }

        card.setIsDeleted(true);
        flashcardRepository.save(card);
    }

    private FlashcardResponse mapToResponse(Flashcard card) {
        return FlashcardResponse.builder()
                .cardId(card.getCardId())
                .setId(card.getFlashcardSet().getSetId())
                .term(card.getTerm())
                .definition(card.getDefinition())
                .orderIndex(card.getOrderIndex())
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt())
                .build();
    }
}
