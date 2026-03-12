package com.kuizu.backend.service;

import com.kuizu.backend.dto.request.CreateFlashcardSetRequest;
import com.kuizu.backend.dto.response.FlashcardSetResponse;
import com.kuizu.backend.entity.*;
import com.kuizu.backend.entity.enumeration.Visibility;
import com.kuizu.backend.entity.enumeration.ModerationStatus;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.repository.FlashcardRepository;
import com.kuizu.backend.repository.FlashcardSetRepository;
import com.kuizu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashcardSetService {
    private final FlashcardSetRepository flashcardSetRepository;
    private final FlashcardRepository flashcardRepository;
    private final UserRepository userRepository;

    @Transactional
    public FlashcardSetResponse createFlashcardSet(CreateFlashcardSetRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found: " + username));

        FlashcardSet flashcardSet = FlashcardSet.builder()
                .owner(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .visibility(request.getVisibility() != null ? request.getVisibility() : Visibility.PUBLIC)
                .status(request.getVisibility() == Visibility.PUBLIC ? ModerationStatus.PENDING : ModerationStatus.APPROVED)
                .isDeleted(false)
                .version(1)
                .submittedBy(user.getUserId())
                .build();

        if (flashcardSet.getStatus() == ModerationStatus.PENDING) {
            flashcardSet.setSubmittedAt(java.time.LocalDateTime.now());
        }

        flashcardSet = flashcardSetRepository.save(flashcardSet);

        if (request.getFlashcards() != null && !request.getFlashcards().isEmpty()) {
            FlashcardSet finalSet = flashcardSet;
            List<Flashcard> flashcards = request.getFlashcards().stream()
                    .map(item -> Flashcard.builder()
                            .flashcardSet(finalSet)
                            .term(item.getTerm())
                            .definition(item.getDefinition())
                            .orderIndex(item.getOrderIndex())
                            .isDeleted(false)
                            .createdBy(user.getUserId())
                            .build())
                    .collect(Collectors.toList());
            flashcardRepository.saveAll(flashcards);
        }

        return mapToResponse(flashcardSet);
    }

    public List<FlashcardSetResponse> getUserSets(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found: " + username));
        return flashcardSetRepository.findByOwnerAndIsDeletedFalse(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FlashcardSetResponse getFlashcardSet(Long setId) {
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new ApiException("Flashcard set not found: " + setId));
        return mapToResponse(set);
    }

    private FlashcardSetResponse mapToResponse(FlashcardSet set) {
        return FlashcardSetResponse.builder()
                .setId(set.getSetId())
                .ownerUserId(set.getOwner().getUserId())
                .ownerDisplayName(set.getOwner().getDisplayName())
                .title(set.getTitle())
                .description(set.getDescription())
                .visibility(set.getVisibility())
                .flashcardCount(flashcardRepository.findByFlashcardSetAndIsDeletedFalseOrderByOrderIndexAsc(set).size())
                .createdAt(set.getCreatedAt())
                .updatedAt(set.getUpdatedAt())
                .build();
    }
}
