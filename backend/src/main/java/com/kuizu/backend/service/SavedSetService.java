package com.kuizu.backend.service;

import com.kuizu.backend.dto.response.FlashcardSetResponse;
import com.kuizu.backend.entity.FlashcardSet;
import com.kuizu.backend.entity.SavedSet;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.repository.FlashcardRepository;
import com.kuizu.backend.repository.FlashcardSetRepository;
import com.kuizu.backend.repository.SavedSetRepository;
import com.kuizu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedSetService {

    private final SavedSetRepository savedSetRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final UserRepository userRepository;
    private final FlashcardRepository flashcardRepository;

    @Transactional
    public void saveSet(Long setId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        FlashcardSet set = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Flashcard set not found"));
        
        SavedSet.SavedSetId id = new SavedSet.SavedSetId(user.getUserId(), setId);
        
        if (savedSetRepository.existsById(id)) {
            return; // Already saved
        }
        
        SavedSet savedSet = SavedSet.builder()
                .id(id)
                .user(user)
                .flashcardSet(set)
                .build();
        
        savedSetRepository.save(savedSet);
    }

    @Transactional
    public void unsaveSet(Long setId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        savedSetRepository.deleteById_UserIdAndId_SetId(user.getUserId(), setId);
    }

    @Transactional(readOnly = true)
    public List<FlashcardSetResponse> getSavedSets(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return savedSetRepository.findByUserOrderBySavedAtDesc(user).stream()
                .map(savedSet -> {
                    FlashcardSet set = savedSet.getFlashcardSet();
                    return FlashcardSetResponse.builder()
                            .setId(set.getSetId())
                            .ownerId(set.getOwner().getUserId())
                            .ownerDisplayName(set.getOwner().getDisplayName())
                            .title(set.getTitle())
                            .description(set.getDescription())
                            .visibility(set.getVisibility().name())
                            .status(set.getStatus().name())
                            .cardCount((int) flashcardRepository.countByFlashcardSetAndIsDeletedFalse(set))
                            .createdAt(set.getCreatedAt())
                            .updatedAt(set.getUpdatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isSetSaved(Long setId, String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return false;
        return savedSetRepository.existsById_UserIdAndId_SetId(user.getUserId(), setId);
    }
}
