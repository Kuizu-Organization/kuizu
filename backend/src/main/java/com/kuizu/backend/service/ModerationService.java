package com.kuizu.backend.service;

import com.kuizu.backend.dto.response.ClassSubmissionResponse;
import com.kuizu.backend.dto.response.FlashcardSetSubmissionResponse;
import com.kuizu.backend.dto.response.ModerationHistoryResponse;
import com.kuizu.backend.entity.Class;
import com.kuizu.backend.entity.FlashcardSet;
import com.kuizu.backend.entity.ModerationHistory;
import com.kuizu.backend.repository.ClassRepository;
import com.kuizu.backend.repository.FlashcardSetRepository;
import com.kuizu.backend.repository.ModerationHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ModerationService {

    private final FlashcardSetRepository flashcardSetRepository;
    private final ClassRepository classRepository;
    private final ModerationHistoryRepository moderationHistoryRepository;

    @Autowired
    public ModerationService(FlashcardSetRepository flashcardSetRepository,
            ClassRepository classRepository,
            ModerationHistoryRepository moderationHistoryRepository) {
        this.flashcardSetRepository = flashcardSetRepository;
        this.classRepository = classRepository;
        this.moderationHistoryRepository = moderationHistoryRepository;
    }

    public List<FlashcardSetSubmissionResponse> getPendingFlashcardSets() {
        return flashcardSetRepository.findByStatusAndIsDeletedFalse("PENDING").stream()
                .map(this::mapToFlashcardSetSubmissionResponse)
                .collect(Collectors.toList());
    }

    public List<ClassSubmissionResponse> getPendingClasses() {
        return classRepository.findByStatus("PENDING").stream()
                .map(this::mapToClassSubmissionResponse)
                .collect(Collectors.toList());
    }

    public List<ModerationHistoryResponse> getModerationHistory() {
        return moderationHistoryRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::mapToModerationHistoryResponse)
                .collect(Collectors.toList());
    }

    private FlashcardSetSubmissionResponse mapToFlashcardSetSubmissionResponse(FlashcardSet set) {
        return FlashcardSetSubmissionResponse.builder()
                .setId(set.getSetId())
                .ownerUsername(set.getOwner() != null ? set.getOwner().getUsername() : null)
                .ownerDisplayName(set.getOwner() != null ? set.getOwner().getDisplayName() : null)
                .title(set.getTitle())
                .description(set.getDescription())
                .visibility(set.getVisibility())
                .submittedAt(set.getSubmittedAt())
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
        return ModerationHistoryResponse.builder()
                .modId(history.getModId())
                .moderatorUsername(history.getModerator() != null ? history.getModerator().getUsername() : null)
                .moderatorDisplayName(history.getModerator() != null ? history.getModerator().getDisplayName() : null)
                .entityType(history.getEntityType())
                .entityId(history.getEntityId())
                .action(history.getAction())
                .notes(history.getNotes())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
