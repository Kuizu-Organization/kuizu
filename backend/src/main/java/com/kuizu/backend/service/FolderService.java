package com.kuizu.backend.service;

import com.kuizu.backend.dto.request.CreateFolderRequest;
import com.kuizu.backend.dto.request.FlashcardSetRequest;
import com.kuizu.backend.dto.request.UpdateFolderRequest;
import com.kuizu.backend.dto.response.FlashcardSetResponse;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.dto.response.FolderDetailResponse;
import com.kuizu.backend.dto.response.FolderResponse;
import com.kuizu.backend.entity.*;
import com.kuizu.backend.entity.enumeration.Visibility;
import com.kuizu.backend.entity.enumeration.ModerationStatus;
import com.kuizu.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.LinkedHashSet;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolderService {

    private final FolderRepository folderRepository;
    private final FolderSetRepository folderSetRepository;
    private final FlashcardRepository flashcardRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public FolderResponse createFolder(CreateFolderRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (folderRepository.existsByNameAndOwnerAndIsDeletedFalse(request.getName(), user)) {
            throw new ApiException("A folder with the name '" + request.getName() + "' already exists in your collection.");
        }

        String visibility = request.getVisibility();
        if (visibility == null || (!visibility.equals("PUBLIC") && !visibility.equals("PRIVATE"))) {
            visibility = "PUBLIC";
        }

        Folder folder = Folder.builder()
                .name(request.getName())
                .description(request.getDescription())
                .visibility(visibility)
                .owner(user)
                .isDeleted(false)
                .build();

        Folder saved = folderRepository.save(folder);

        long setCount = 0;
        if (request.getSetIds() != null && !request.getSetIds().isEmpty()) {
            for (Long setId : request.getSetIds()) {
                FlashcardSet flashcardSet = flashcardSetRepository.findById(setId).orElse(null);
                if (flashcardSet != null) {
                    FolderSet.FolderSetId id = new FolderSet.FolderSetId(saved.getFolderId(), setId);
                    FolderSet folderSet = FolderSet.builder()
                            .id(id)
                            .folder(saved)
                            .flashcardSet(flashcardSet)
                            .addedBy(user.getUserId().toString())
                            .build();

                    folderSetRepository.save(folderSet);
                    setCount++;
                }
            }
        }

        return FolderResponse.builder()
                .folderId(saved.getFolderId())
                .name(saved.getName())
                .description(saved.getDescription())
                .visibility(saved.getVisibility())
                .setCount(setCount)
                .ownerDisplayName(user.getDisplayName())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUserFlashcardSets(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<FlashcardSet> userSets = flashcardSetRepository.findByOwnerAndIsDeletedFalse(user);

        return userSets.stream()
                .map(s -> {
                    long termCount = flashcardRepository.countByFlashcardSetAndIsDeletedFalse(s);
                    return Map.<String, Object>of(
                            "setId", s.getSetId(),
                            "title", s.getTitle() != null ? s.getTitle() : "",
                            "description", s.getDescription() != null ? s.getDescription() : "",
                            "termCount", termCount,
                            "createdAt", s.getCreatedAt() != null ? s.getCreatedAt().toString() : ""
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public FolderResponse updateFolder(Long folderId, UpdateFolderRequest request, String username) {
        Folder folder = folderRepository.findByFolderIdAndIsDeletedFalse(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        if (!folder.getOwner().getUsername().equals(username)) {
            throw new RuntimeException("You do not have permission to update this folder");
        }

        String visibility = request.getVisibility();
        if (visibility == null || (!visibility.equals("PUBLIC") && !visibility.equals("PRIVATE"))) {
            visibility = "PUBLIC";
        }

        if (request.getName() != null && !request.getName().equals(folder.getName())) {
            if (folderRepository.existsByNameAndOwnerAndIsDeletedFalse(request.getName(), folder.getOwner())) {
                throw new ApiException("A folder with the name '" + request.getName() + "' already exists in your collection.");
            }
            folder.setName(request.getName());
        }

        folder.setDescription(request.getDescription());
        folder.setVisibility(visibility);

        Folder saved = folderRepository.save(folder);
        long setCount = folderSetRepository.countByFolder(saved);

        return FolderResponse.builder()
                .folderId(saved.getFolderId())
                .name(saved.getName())
                .description(saved.getDescription())
                .visibility(saved.getVisibility())
                .setCount(setCount)
                .ownerDisplayName(saved.getOwner().getDisplayName())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteFolder(Long folderId, String username) {
        Folder folder = folderRepository.findByFolderIdAndIsDeletedFalse(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        if (!folder.getOwner().getUsername().equals(username)) {
            throw new RuntimeException("You do not have permission to delete this folder");
        }

        // Soft delete the folder
        folder.setIsDeleted(true);
        folderRepository.save(folder);
        
        // Optional: Depending on logic, might want to remove all FolderSets or just leave them
        // Setting folder.isDeleted=true is usually enough if queries filter by it.
    }

    @Transactional
    public void addSetToFolder(Long folderId, Long setId, String username, String category) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found"));

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ApiException("Folder not found"));

        if (!folder.getOwner().getUserId().equals(user.getUserId())) {
            throw new ApiException("You don't own this folder");
        }

        FlashcardSet flashcardSet = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new ApiException("Flashcard set not found"));

        FolderSet.FolderSetId id = new FolderSet.FolderSetId(folderId, setId);
        FolderSet folderSet = folderSetRepository.findById(id).orElse(null);
        
        if (folderSet == null) {
            folderSet = FolderSet.builder()
                    .id(id)
                    .folder(folder)
                    .flashcardSet(flashcardSet)
                    .addedBy(user.getUserId().toString())
                    .build();
            folderSetRepository.save(folderSet);
        }

        // Update category if provided and valid
        if (category != null && !category.equalsIgnoreCase("all") && !category.equalsIgnoreCase("Uncategorized")) {
            flashcardSet.setCategory(category);
            flashcardSetRepository.save(flashcardSet);
        }
    }


    @Transactional
    public void removeSetFromFolder(Long folderId, Long setId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        if (!folder.getOwner().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("You don't own this folder");
        }

        FolderSet.FolderSetId id = new FolderSet.FolderSetId(folderId, setId);
        if (!folderSetRepository.existsById(id)) {
            throw new RuntimeException("This set is not in the folder");
        }

        folderSetRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailableSets(Long folderId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        List<FolderSet> existingSets = folderSetRepository.findByFolder(folder);
        Set<Long> existingSetIds = existingSets.stream()
                .map(fs -> fs.getFlashcardSet().getSetId())
                .collect(Collectors.toSet());

        List<FlashcardSet> availableSets = flashcardSetRepository.findAllAvailableForUser(user);

        return availableSets.stream()
                .filter(s -> !existingSetIds.contains(s.getSetId()))
                .map(s -> {
                    long termCount = flashcardRepository.countByFlashcardSetAndIsDeletedFalse(s);
                    return Map.<String, Object>of(
                            "setId", s.getSetId(),
                            "title", s.getTitle() != null ? s.getTitle() : "",
                            "description", s.getDescription() != null ? s.getDescription() : "",
                            "termCount", termCount,
                            "ownerDisplayName", s.getOwner() != null ? s.getOwner().getDisplayName() : "",
                            "createdAt", s.getCreatedAt() != null ? s.getCreatedAt().toString() : ""
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FolderResponse> getUserFolders(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Folder> folders = folderRepository.findByOwnerAndIsDeletedFalse(user);
        return mapFoldersToResponse(folders);
    }

    @Transactional(readOnly = true)
    public List<FolderResponse> getPublicFolders(String username) {
        List<Folder> folders = folderRepository.findByVisibilityAndIsDeletedFalse("PUBLIC");
        return mapFoldersToResponse(folders);
    }

    private List<FolderResponse> mapFoldersToResponse(List<Folder> folders) {
        return folders.stream().map(folder -> FolderResponse.builder()
                .folderId(folder.getFolderId())
                .name(folder.getName())
                .description(folder.getDescription())
                .visibility(folder.getVisibility())
                .setCount(folderSetRepository.countByFolder(folder))
                .ownerDisplayName(folder.getOwner().getDisplayName())
                .createdAt(folder.getCreatedAt())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FolderDetailResponse getFolderDetail(Long folderId, String username) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        if (folder.getIsDeleted() != null && folder.getIsDeleted()) {
            throw new RuntimeException("Folder not found");
        }

        List<FolderSet> folderSets = folderSetRepository.findByFolder(folder);

        List<FolderDetailResponse.FlashcardSetSummary> allSets = folderSets.stream()
                .map(fs -> mapToSummary(fs))
                .collect(Collectors.toList());

        // Group sets by category
        Map<String, List<FolderDetailResponse.FlashcardSetSummary>> groupedBySet = allSets.stream()
                .filter(s -> s.getCategory() != null)
                .collect(Collectors.groupingBy(FolderDetailResponse.FlashcardSetSummary::getCategory));

        List<FolderDetailResponse.FlashcardSetSummary> uncategorizedSets = allSets.stream()
                .filter(s -> s.getCategory() == null)
                .collect(Collectors.toList());

        // Get all unique categories (defined in folder + those present in sets)
        Set<String> allCategoryNames = new LinkedHashSet<>(folder.getCategories());
        groupedBySet.keySet().forEach(allCategoryNames::add);

        List<FolderDetailResponse.CategorySummary> categorySummaries = allCategoryNames.stream()
                .map(name -> FolderDetailResponse.CategorySummary.builder()
                        .name(name)
                        .sets(groupedBySet.getOrDefault(name, Collections.emptyList()))
                        .build())
                .collect(Collectors.toList());

        return FolderDetailResponse.builder()
                .folderId(folder.getFolderId())
                .name(folder.getName())
                .description(folder.getDescription())
                .visibility(folder.getVisibility())
                .ownerDisplayName(folder.getOwner().getDisplayName())
                .ownerUsername(folder.getOwner().getUsername())
                .createdAt(folder.getCreatedAt())
                .categories(categorySummaries)
                .sets(allSets) // "All" tab uses this
                .build();
    }

    @Transactional
    public void addCategoryToFolder(Long folderId, String categoryName, String username) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ApiException("Folder not found"));

        if (!folder.getOwner().getUsername().equals(username)) {
            throw new ApiException("You do not have permission to modify this folder");
        }

        if (!folder.getCategories().contains(categoryName)) {
            folder.getCategories().add(categoryName);
            folderRepository.save(folder);
        }
    }

    @Transactional
    public void removeCategoryFromFolder(Long folderId, String categoryName, String username) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ApiException("Folder not found"));

        if (!folder.getOwner().getUsername().equals(username)) {
            throw new ApiException("You do not have permission to modify this folder");
        }

        folder.getCategories().remove(categoryName);
        folderRepository.save(folder);
    }

    private FolderDetailResponse.FlashcardSetSummary mapToSummary(FolderSet fs) {
        var flashcardSet = fs.getFlashcardSet();
        List<Flashcard> cards = flashcardRepository
                .findByFlashcardSetAndIsDeletedFalseOrderByOrderIndexAsc(flashcardSet);

        List<FolderDetailResponse.FlashcardItem> flashcardItems = cards.stream()
                .map(card -> FolderDetailResponse.FlashcardItem.builder()
                        .cardId(card.getCardId())
                        .term(card.getTerm())
                        .definition(card.getDefinition())
                        .orderIndex(card.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        return FolderDetailResponse.FlashcardSetSummary.builder()
                .setId(flashcardSet.getSetId())
                .category(flashcardSet.getCategory())
                .title(flashcardSet.getTitle())
                .description(flashcardSet.getDescription())
                .termCount(cards.size())
                .ownerDisplayName(flashcardSet.getOwner().getDisplayName())
                .ownerUsername(flashcardSet.getOwner().getUsername())
                .createdAt(flashcardSet.getCreatedAt())
                .flashcards(flashcardItems)
                .build();
    }

    @Transactional
    public FlashcardSetResponse createSetInFolder(Long folderId, FlashcardSetRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        if (!folder.getOwner().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("You don't own this folder");
        }

        // 1. Create the set
        FlashcardSet set = FlashcardSet.builder()
                .owner(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .visibility(request.getVisibility() != null ? Visibility.valueOf(request.getVisibility().toUpperCase())
                        : Visibility.PUBLIC)
                .status(ModerationStatus.PENDING)
                .isDeleted(false)
                .version(1)
                .submittedBy(user.getUserId().toString())
                .submittedAt(java.time.LocalDateTime.now())
                .build();

        FlashcardSet savedSet = flashcardSetRepository.save(set);

        // 2. Add to folder
        FolderSet.FolderSetId id = new FolderSet.FolderSetId(folderId, savedSet.getSetId());
        FolderSet folderSet = FolderSet.builder()
                .id(id)
                .folder(folder)
                .flashcardSet(savedSet)
                .addedBy(user.getUserId().toString())
                .build();

        folderSetRepository.save(folderSet);

        // Notify admins/user (borrowed from FlashcardSetService logic)
        notificationService.notifyAdmins(
                "New Flashcard Set Pending Review",
                "A new flashcard set '" + savedSet.getTitle() + "' was created in folder '" + folder.getName() + "' by " + user.getDisplayName() + " (@"
                        + user.getUsername() + ") and needs moderation.",
                savedSet.getSetId().toString());

        notificationService.sendNotification(
                user,
                "Flashcard Set Under Review",
                "Your newly created flashcard set '" + savedSet.getTitle()
                        + "' in folder '" + folder.getName() + "' is currently pending moderation.",
                "SYSTEM",
                savedSet.getSetId().toString());

        return FlashcardSetResponse.builder()
                .setId(savedSet.getSetId())
                .ownerId(savedSet.getOwner().getUserId())
                .ownerDisplayName(savedSet.getOwner().getDisplayName())
                .title(savedSet.getTitle())
                .description(savedSet.getDescription())
                .visibility(savedSet.getVisibility().name())
                .status(savedSet.getStatus().name())
                .cardCount(0)
                .createdAt(savedSet.getCreatedAt())
                .build();
    }
}
