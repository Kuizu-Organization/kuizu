package com.kuizu.backend.service;

import com.kuizu.backend.dto.request.FlashcardSetRequest;
import com.kuizu.backend.dto.response.FlashcardSetResponse;
import com.kuizu.backend.entity.Flashcard;
import com.kuizu.backend.entity.FlashcardSet;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.entity.enumeration.ModerationStatus;
import com.kuizu.backend.entity.enumeration.Visibility;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.repository.FlashcardRepository;
import com.kuizu.backend.repository.FlashcardSetRepository;
import com.kuizu.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FlashcardSetService {

    @Autowired
    private FlashcardSetRepository flashcardSetRepository;

    @Autowired
    private FlashcardRepository flashcardRepository;

    @Autowired
    private UserRepository userRepository;

    public List<FlashcardSetResponse> getAllPublicSets() {
        return flashcardSetRepository.findByVisibilityAndStatusAndIsDeletedFalse(Visibility.PUBLIC, ModerationStatus.APPROVED)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FlashcardSetResponse> getSetsByOwner(String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found"));
        return flashcardSetRepository.findByOwnerAndIsDeletedFalse(owner)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FlashcardSetResponse getSetById(Long setId) {
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .filter(s -> s.getIsDeleted() == null || !s.getIsDeleted())
                .orElseThrow(() -> new ApiException("Flashcard set not found"));
        return mapToResponse(set);
    }

    public FlashcardSetResponse getFlashcardSet(Long setId, String username) {
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .filter(s -> s.getIsDeleted() == null || !s.getIsDeleted())
                .orElseThrow(() -> new ApiException("Flashcard set not found"));

        boolean isOwner = false;
        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                isOwner = set.getOwner().getUserId().equals(user.getUserId());
            }
        }

        if (!isOwner) {
            if (set.getVisibility() != Visibility.PUBLIC || set.getStatus() != ModerationStatus.APPROVED) {
                throw new ApiException("Access denied: flashcard set is private or pending moderation.");
            }
        }

        return mapToResponse(set);
    }

    @Transactional
    public FlashcardSetResponse createSet(String username, FlashcardSetRequest request) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found"));

        Visibility visibility = request.getVisibility() != null ? 
            Visibility.valueOf(request.getVisibility().toUpperCase()) : Visibility.PUBLIC;
        
        ModerationStatus status = (visibility == Visibility.PUBLIC) ? 
            ModerationStatus.PENDING : ModerationStatus.ACTIVE;

        FlashcardSet set = FlashcardSet.builder()
                .owner(owner)
                .title(request.getTitle())
                .description(request.getDescription())
                .visibility(visibility)
                .status(status)
                .isDeleted(false)
                .version(1)
                .submittedAt(status == ModerationStatus.PENDING ? LocalDateTime.now() : null)
                .build();

        final FlashcardSet savedSet = flashcardSetRepository.save(set);

        if (request.getFlashcards() != null && !request.getFlashcards().isEmpty()) {
            List<Flashcard> flashcards = request.getFlashcards().stream()
                    .map(item -> Flashcard.builder()
                            .flashcardSet(savedSet)
                            .term(item.getTerm())
                            .definition(item.getDefinition())
                            .orderIndex(item.getOrderIndex())
                            .createdBy(owner.getUserId())
                            .isDeleted(false)
                            .build())
                    .collect(Collectors.toList());
            flashcardRepository.saveAll(flashcards);
        }

        return mapToResponse(savedSet);
    }

    @Transactional
    public FlashcardSetResponse updateSet(Long setId, String username, FlashcardSetRequest request) {
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .filter(s -> s.getIsDeleted() == null || !s.getIsDeleted())
                .orElseThrow(() -> new ApiException("Flashcard set not found"));

        if (!set.getOwner().getUsername().equals(username)) {
            throw new ApiException("You do not have permission to update this set");
        }

        if (request.getTitle() != null) set.setTitle(request.getTitle());
        if (request.getDescription() != null) set.setDescription(request.getDescription());
        if (request.getVisibility() != null) {
            Visibility newVisibility = Visibility.valueOf(request.getVisibility().toUpperCase());
            if (set.getVisibility() != newVisibility) {
                set.setVisibility(newVisibility);
                if (newVisibility == Visibility.PUBLIC) {
                    set.setStatus(ModerationStatus.PENDING);
                    set.setSubmittedAt(LocalDateTime.now());
                } else {
                    set.setStatus(ModerationStatus.ACTIVE);
                }
            }
        }

        FlashcardSet updatedSet = flashcardSetRepository.save(set);
        return mapToResponse(updatedSet);
    }

    @Transactional
    public void deleteSet(Long setId, String username) {
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .filter(s -> s.getIsDeleted() == null || !s.getIsDeleted())
                .orElseThrow(() -> new ApiException("Flashcard set not found"));

        if (!set.getOwner().getUsername().equals(username)) {
            throw new ApiException("You do not have permission to delete this set");
        }

        set.setIsDeleted(true);
        flashcardSetRepository.save(set);
    }

    public List<FlashcardSetResponse> findSetsByTitle(String title) {
        return flashcardSetRepository.findByTitleContainingIgnoreCaseAndVisibilityAndStatusAndIsDeletedFalse(
                title, Visibility.PUBLIC, ModerationStatus.APPROVED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FlashcardSetResponse> getSuggestedSets(int limit) {
        return flashcardSetRepository.findRandomPublicSets(limit)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private FlashcardSetResponse mapToResponse(FlashcardSet set) {
        long count = flashcardRepository.countByFlashcardSetAndIsDeletedFalse(set);
        return FlashcardSetResponse.builder()
                .setId(set.getSetId())
                .ownerId(set.getOwner().getUserId())
                .ownerDisplayName(set.getOwner().getDisplayName())
                .title(set.getTitle())
                .description(set.getDescription())
                .visibility(set.getVisibility() != null ? set.getVisibility().name() : null)
                .status(set.getStatus() != null ? set.getStatus().name() : null)
                .cardCount((int) count)
                .createdAt(set.getCreatedAt())
                .updatedAt(set.getUpdatedAt())
                .build();
    }
}
