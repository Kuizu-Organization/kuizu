package com.kuizu.backend.service;

import com.kuizu.backend.dto.request.FlashcardSetRequest;
import com.kuizu.backend.dto.response.FlashcardSetResponse;
import com.kuizu.backend.entity.FlashcardSet;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.repository.FlashcardRepository;
import com.kuizu.backend.repository.FlashcardSetRepository;
import com.kuizu.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kuizu.backend.entity.enumeration.Visibility;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FlashcardSetService {

    private final FlashcardSetRepository flashcardSetRepository;
    private final FlashcardRepository flashcardRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public FlashcardSetService(FlashcardSetRepository flashcardSetRepository,
            FlashcardRepository flashcardRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.flashcardSetRepository = flashcardSetRepository;
        this.flashcardRepository = flashcardRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Autowired
    private StatisticService statisticService;

    public List<FlashcardSetResponse> getAllPublicSets() {
        return flashcardSetRepository.findByVisibilityAndIsDeletedFalse(Visibility.PUBLIC)
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
        statisticService.incrementSetViewCount(set);
        return mapToResponse(set);
    }

    @Transactional
    public FlashcardSetResponse createSet(String username, FlashcardSetRequest request) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found"));

        FlashcardSet set = FlashcardSet.builder()
                .owner(owner)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .visibility(request.getVisibility() != null ? Visibility.valueOf(request.getVisibility().toUpperCase())
                        : Visibility.PUBLIC)
                .status(com.kuizu.backend.entity.enumeration.ModerationStatus.PENDING)
                .isDeleted(false)
                .version(1)
                .submittedBy(owner.getUserId().toString())
                .submittedAt(java.time.LocalDateTime.now())
                .build();

        set = flashcardSetRepository.save(set);

        // Notify admins
        notificationService.notifyAdmins(
                "New Flashcard Set Pending Review",
                "A new flashcard set '" + set.getTitle() + "' was created by " + owner.getDisplayName() + " (@"
                        + owner.getUsername() + ") and needs moderation.",
                set.getSetId().toString());

        // Notify user
        notificationService.sendNotification(
                owner,
                "Flashcard Set Under Review",
                "Your newly created flashcard set '" + set.getTitle()
                        + "' is currently pending moderation and awaiting review by the admins.",
                "SYSTEM",
                set.getSetId().toString());

        return mapToResponse(set);
    }

    @Transactional
    public FlashcardSetResponse updateSet(Long setId, String username, FlashcardSetRequest request) {
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .filter(s -> s.getIsDeleted() == null || !s.getIsDeleted())
                .orElseThrow(() -> new ApiException("Flashcard set not found"));

        if (!set.getOwner().getUsername().equals(username)) {
            throw new ApiException("You do not have permission to update this set");
        }

        if (request.getTitle() != null)
            set.setTitle(request.getTitle());
        if (request.getDescription() != null)
            set.setDescription(request.getDescription());
        if (request.getCategory() != null)
            set.setCategory(request.getCategory());
        if (request.getVisibility() != null)
            set.setVisibility(Visibility.valueOf(request.getVisibility().toUpperCase()));

        set = flashcardSetRepository.save(set);
        return mapToResponse(set);
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

    @Transactional
    public FlashcardSetResponse reRequestReview(Long setId, String username) {
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .filter(s -> s.getIsDeleted() == null || !s.getIsDeleted())
                .orElseThrow(() -> new ApiException("Flashcard set not found"));

        if (!set.getOwner().getUsername().equals(username)) {
            throw new ApiException("You do not have permission to re-request review for this set");
        }

        if (set.getStatus() == com.kuizu.backend.entity.enumeration.ModerationStatus.APPROVED) {
            throw new ApiException("Flashcard set is already approved");
        }

        if (set.getStatus() == com.kuizu.backend.entity.enumeration.ModerationStatus.PENDING) {
            throw new ApiException("Flashcard set is already pending review");
        }

        set.setStatus(com.kuizu.backend.entity.enumeration.ModerationStatus.PENDING);
        set.setSubmittedAt(java.time.LocalDateTime.now());
        set.setSubmittedBy(set.getOwner().getUserId());
        set.setVersion(set.getVersion() == null ? 1 : set.getVersion() + 1);

        set = flashcardSetRepository.save(set);

        // Notify admins
        notificationService.notifyAdmins(
                "Flashcard Set Re-submission",
                "Flashcard set '" + set.getTitle() + "' was re-submitted for review by "
                        + set.getOwner().getDisplayName()
                        + " (@" + set.getOwner().getUsername() + ").",
                set.getSetId().toString());

        // Notify user
        notificationService.sendNotification(
                set.getOwner(),
                "Flashcard Set Re-submitted",
                "Your flashcard set '" + set.getTitle() + "' has been successfully re-submitted for review.",
                "SYSTEM",
                set.getSetId().toString());

        return mapToResponse(set);
    }

    private FlashcardSetResponse mapToResponse(FlashcardSet set) {
        long count = flashcardRepository.countByFlashcardSetAndIsDeletedFalse(set);
        return FlashcardSetResponse.builder()
                .setId(set.getSetId())
                .ownerId(set.getOwner().getUserId())
                .ownerDisplayName(set.getOwner().getDisplayName())
                .title(set.getTitle())
                .description(set.getDescription())
                .category(set.getCategory())
                .visibility(set.getVisibility() != null ? set.getVisibility().name() : null)
                .status(set.getStatus() != null ? set.getStatus().name() : null)
                .moderationNotes(set.getModerationNotes())
                .cardCount((int) count)
                .createdAt(set.getCreatedAt())
                .updatedAt(set.getUpdatedAt())
                .build();
    }
}
