package com.kuizu.backend.service;

import com.kuizu.backend.dto.request.ModerationRequest;
import com.kuizu.backend.dto.response.ClassSubmissionResponse;
import com.kuizu.backend.dto.response.FlashcardResponse;
import com.kuizu.backend.dto.response.FlashcardSetSubmissionResponse;
import com.kuizu.backend.dto.response.ModerationHistoryResponse;
import com.kuizu.backend.entity.*;
import com.kuizu.backend.entity.Class;
import com.kuizu.backend.entity.enumeration.ModerationStatus;
import com.kuizu.backend.repository.ClassRepository;
import com.kuizu.backend.repository.FlashcardRepository;
import com.kuizu.backend.repository.FlashcardSetRepository;
import com.kuizu.backend.repository.ModerationHistoryRepository;
import com.kuizu.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kuizu.backend.service.NotificationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ModerationService {

    private final FlashcardSetRepository flashcardSetRepository;
    private final ClassRepository classRepository;
    private final ModerationHistoryRepository moderationHistoryRepository;
    private final UserRepository userRepository;
    private final FlashcardRepository flashcardRepository;
    private final NotificationService notificationService;

    @Autowired
    public ModerationService(FlashcardSetRepository flashcardSetRepository,
            ClassRepository classRepository,
            ModerationHistoryRepository moderationHistoryRepository,
            UserRepository userRepository,
            FlashcardRepository flashcardRepository,
            NotificationService notificationService) {
        this.flashcardSetRepository = flashcardSetRepository;
        this.classRepository = classRepository;
        this.moderationHistoryRepository = moderationHistoryRepository;
        this.userRepository = userRepository;
        this.flashcardRepository = flashcardRepository;
        this.notificationService = notificationService;
    }

    public List<FlashcardSetSubmissionResponse> getPendingFlashcardSets() {
        return flashcardSetRepository.findByStatusAndIsDeletedFalse(ModerationStatus.PENDING).stream()
                .map(this::mapToFlashcardSetSubmissionResponse)
                .collect(Collectors.toList());
    }

    private FlashcardResponse mapToFlashcardResponse(Flashcard card) {
        return FlashcardResponse.builder()
                .cardId(card.getCardId())
                .term(card.getTerm())
                .definition(card.getDefinition())
                .orderIndex(card.getOrderIndex())
                .build();
    }

    public List<ClassSubmissionResponse> getPendingClasses() {
        return classRepository.findByStatus(ModerationStatus.PENDING).stream()
                .map(this::mapToClassSubmissionResponse)
                .collect(Collectors.toList());
    }

    public List<ModerationHistoryResponse> getModerationHistory() {
        return moderationHistoryRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::mapToModerationHistoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveFlashcardSet(Long setId, ModerationRequest request) {
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Flashcard set not found"));
        User moderator = getCurrentUser();
        set.setStatus(ModerationStatus.APPROVED);
        set.setModeratedBy(moderator.getUserId());
        set.setModeratedAt(LocalDateTime.now());
        set.setModerationNotes(request.getNotes());
        set = flashcardSetRepository.save(set);
        logModerationAction(moderator, "SET", String.valueOf(setId), "APPROVE", request.getNotes());

        // Notify owner
        notificationService.sendNotification(
            set.getOwner(),
            "Flashcard Set Approved",
            "Your flashcard set '" + set.getTitle() + "' has been approved by the moderator." + 
            (request.getNotes() != null && !request.getNotes().isEmpty() ? "\nFeedback: " + request.getNotes() : ""),
            "MODERATION",
            set.getSetId().toString()
        );
    }

    @Transactional
    public void rejectFlashcardSet(Long setId, ModerationRequest request) {
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Flashcard set not found"));
        User moderator = getCurrentUser();
        set.setStatus(ModerationStatus.REJECTED);
        set.setModeratedBy(moderator.getUserId());
        set.setModeratedAt(LocalDateTime.now());
        set.setModerationNotes(request.getNotes());
        set = flashcardSetRepository.save(set);
        logModerationAction(moderator, "SET", String.valueOf(setId), "REJECT", request.getNotes());

        // Notify owner
        notificationService.sendNotification(
            set.getOwner(),
            "Flashcard Set Rejected",
            "Your flashcard set '" + set.getTitle() + "' has been rejected by the moderator." + 
            (request.getNotes() != null && !request.getNotes().isEmpty() ? "\n\nFeedback: " + request.getNotes() : ""),
            "MODERATION",
            set.getSetId().toString()
        );
    }

    @Transactional
    public void approveClass(Long classId, ModerationRequest request) {
        Class cls = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        User moderator = getCurrentUser();
        cls.setStatus(ModerationStatus.ACTIVE);
        cls.setModeratedBy(moderator.getUserId());
        cls.setModeratedAt(LocalDateTime.now());
        cls.setModerationNotes(request.getNotes());
        cls = classRepository.save(cls);
        logModerationAction(moderator, "CLASS", String.valueOf(classId), "APPROVE", request.getNotes());

        // Notify owner
        notificationService.sendNotification(
            cls.getOwner(),
            "Class Approved",
            "Your class '" + cls.getClassName() + "' has been approved by the moderator.",
            "MODERATION",
            cls.getClassId().toString()
        );
    }

    @Transactional
    public void rejectClass(Long classId, ModerationRequest request) {
        Class cls = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        User moderator = getCurrentUser();
        cls.setStatus(ModerationStatus.REJECTED);
        cls.setModeratedBy(moderator.getUserId());
        cls.setModeratedAt(LocalDateTime.now());
        cls.setModerationNotes(request.getNotes());
        cls = classRepository.save(cls);
        logModerationAction(moderator, "CLASS", String.valueOf(classId), "REJECT", request.getNotes());

        // Notify owner
        notificationService.sendNotification(
            cls.getOwner(),
            "Class Rejected",
            "Your class '" + cls.getClassName() + "' has been rejected by the moderator." + 
            (request.getNotes() != null && !request.getNotes().isEmpty() ? "\n\nFeedback: " + request.getNotes() : ""),
            "MODERATION",
            cls.getClassId().toString()
        );
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public void logUserModeration(String targetUserId, String action, String notes) {
        User moderator = getCurrentUser();
        logModerationAction(moderator, "USER", targetUserId, action, notes);
    }

    private void logModerationAction(User moderator, String entityType, String entityId, String action, String notes) {
        ModerationHistory history = ModerationHistory.builder()
                .moderator(moderator)
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .notes(notes)
                .build();
        moderationHistoryRepository.save(history);
    }

    private FlashcardSetSubmissionResponse mapToFlashcardSetSubmissionResponse(FlashcardSet set) {
        List<FlashcardResponse> flashcards = flashcardRepository.findByFlashcardSetAndIsDeletedFalseOrderByOrderIndexAsc(set).stream()
                .map(this::mapToFlashcardResponse)
                .collect(Collectors.toList());

        return FlashcardSetSubmissionResponse.builder()
                .setId(set.getSetId())
                .ownerUsername(set.getOwner() != null ? set.getOwner().getUsername() : null)
                .ownerDisplayName(set.getOwner() != null ? set.getOwner().getDisplayName() : null)
                .title(set.getTitle())
                .description(set.getDescription())
                .visibility(set.getVisibility())
                .submittedAt(set.getSubmittedAt())
                .flashcards(flashcards)
                .build();
    }

    private ClassSubmissionResponse mapToClassSubmissionResponse(Class cls) {
        return ClassSubmissionResponse.builder()
                .classId(cls.getClassId())
                .ownerUsername(cls.getOwner() != null ? cls.getOwner().getUsername() : null)
                .ownerDisplayName(cls.getOwner() != null ? cls.getOwner().getDisplayName() : null)
                .className(cls.getClassName())
                .description(cls.getDescription())
                .joinCode(cls.getJoinCode())
                .visibility(cls.getVisibility())
                .submittedAt(cls.getSubmittedAt())
                .build();
    }

    private ModerationHistoryResponse mapToModerationHistoryResponse(ModerationHistory history) {
        String entityName = "Unknown";
        try {
            if ("SET".equals(history.getEntityType())) {
                entityName = flashcardSetRepository.findById(Long.parseLong(history.getEntityId()))
                        .map(FlashcardSet::getTitle).orElse("Deleted Set");
            } else if ("CLASS".equals(history.getEntityType())) {
                entityName = classRepository.findById(Long.parseLong(history.getEntityId()))
                        .map(Class::getClassName).orElse("Deleted Class");
            } else if ("USER".equals(history.getEntityType())) {
                entityName = userRepository.findById(history.getEntityId())
                        .map(user -> user.getDisplayName() != null ? user.getDisplayName() : user.getUsername())
                        .orElse("Deleted User");
            }
        } catch (Exception e) {
            entityName = "Invalid ID";
        }

        return ModerationHistoryResponse.builder()
                .modId(history.getModId())
                .moderatorUsername(history.getModerator() != null ? history.getModerator().getUsername() : null)
                .moderatorDisplayName(history.getModerator() != null ? history.getModerator().getDisplayName() : null)
                .entityType(history.getEntityType())
                .entityId(history.getEntityId())
                .entityName(entityName)
                .action(history.getAction())
                .notes(history.getNotes())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
