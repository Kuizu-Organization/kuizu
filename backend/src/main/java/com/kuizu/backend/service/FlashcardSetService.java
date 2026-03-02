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
        return flashcardSetRepository.findByVisibilityAndIsDeletedFalse("PUBLIC")
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

    @Transactional
    public FlashcardSetResponse createSet(String username, FlashcardSetRequest request) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found"));

        FlashcardSet set = FlashcardSet.builder()
                .owner(owner)
                .title(request.getTitle())
                .description(request.getDescription())
                .visibility(request.getVisibility() != null ? request.getVisibility() : "PUBLIC")
                .status("ACTIVE")
                .isDeleted(false)
                .version(1)
                .build();

        set = flashcardSetRepository.save(set);
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

        if (request.getTitle() != null) set.setTitle(request.getTitle());
        if (request.getDescription() != null) set.setDescription(request.getDescription());
        if (request.getVisibility() != null) set.setVisibility(request.getVisibility());

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

    private FlashcardSetResponse mapToResponse(FlashcardSet set) {
        long count = flashcardRepository.countByFlashcardSetAndIsDeletedFalse(set);
        return FlashcardSetResponse.builder()
                .setId(set.getSetId())
                .ownerId(set.getOwner().getUserId())
                .ownerDisplayName(set.getOwner().getDisplayName())
                .title(set.getTitle())
                .description(set.getDescription())
                .visibility(set.getVisibility())
                .status(set.getStatus())
                .cardCount((int) count)
                .createdAt(set.getCreatedAt())
                .updatedAt(set.getUpdatedAt())
                .build();
    }
}
