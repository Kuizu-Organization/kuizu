package com.kuizu.backend.service;

import com.kuizu.backend.dto.request.CreateFolderRequest;
import com.kuizu.backend.dto.request.FlashcardSetRequest;
import com.kuizu.backend.dto.request.UpdateFolderRequest;
import com.kuizu.backend.dto.response.FlashcardSetResponse;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.dto.response.FolderDetailResponse;
import com.kuizu.backend.dto.response.FolderResponse;
import com.kuizu.backend.dto.response.FolderDetailResponse.*;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolderService {

    private final FolderRepository folderRepository;
    private final FolderBranchRepository folderBranchRepository;
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
    public void addSetToFolder(Long folderId, Long setId, String username) {
        addSetToFolder(folderId, setId, null, username);
    }

    @Transactional
    public void addSetToFolder(Long folderId, Long setId, Long branchId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        if (!folder.getOwner().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("You don't own this folder");
        }

        FlashcardSet flashcardSet = flashcardSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Flashcard set not found"));

        FolderBranch branch = null;
        if (branchId != null) {
            branch = folderBranchRepository.findById(branchId)
                    .orElseThrow(() -> new RuntimeException("Branch not found"));
        }

        FolderSet.FolderSetId id = new FolderSet.FolderSetId(folderId, setId);
        FolderSet folderSet = folderSetRepository.findById(id).orElse(null);
        
        if (folderSet != null) {
            folderSet.setBranch(branch);
            folderSetRepository.save(folderSet);
        } else {
            folderSet = FolderSet.builder()
                    .id(id)
                    .folder(folder)
                    .flashcardSet(flashcardSet)
                    .branch(branch)
                    .addedBy(user.getUserId().toString())
                    .build();
            folderSetRepository.save(folderSet);
        }
    }

    @Transactional
    public FolderDetailResponse.BranchSummary createBranch(Long folderId, String name, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Folder folder = folderRepository.findByFolderIdAndIsDeletedFalse(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        if (!folder.getOwner().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("You don't own this folder");
        }

        FolderBranch branch = FolderBranch.builder()
                .folder(folder)
                .name(name)
                .isDeleted(false)
                .build();

        FolderBranch saved = folderBranchRepository.save(branch);

        return FolderDetailResponse.BranchSummary.builder()
                .branchId(saved.getBranchId())
                .name(saved.getName())
                .sets(java.util.Collections.emptyList())
                .build();
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

        List<FlashcardSet> userSets = flashcardSetRepository.findByOwnerAndIsDeletedFalse(user);

        return userSets.stream()
                .filter(s -> !existingSetIds.contains(s.getSetId()))
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

        List<FolderBranch> branches = folderBranchRepository.findByFolderAndIsDeletedFalse(folder);
        List<FolderSet> folderSets = folderSetRepository.findByFolder(folder);

        List<FolderDetailResponse.FlashcardSetSummary> allSets = folderSets.stream()
                .map(fs -> mapToSummary(fs))
                .collect(Collectors.toList());

        List<FolderDetailResponse.BranchSummary> branchSummaries = branches.stream()
                .map(b -> {
                    List<FolderDetailResponse.FlashcardSetSummary> branchSets = folderSets.stream()
                            .filter(fs -> fs.getBranch() != null && fs.getBranch().getBranchId().equals(b.getBranchId()))
                            .map(fs -> mapToSummary(fs))
                            .collect(Collectors.toList());
                    
                    return FolderDetailResponse.BranchSummary.builder()
                            .branchId(b.getBranchId())
                            .name(b.getName())
                            .sets(branchSets)
                            .build();
                })
                .collect(Collectors.toList());

        return FolderDetailResponse.builder()
                .folderId(folder.getFolderId())
                .name(folder.getName())
                .description(folder.getDescription())
                .visibility(folder.getVisibility())
                .ownerDisplayName(folder.getOwner().getDisplayName())
                .ownerUsername(folder.getOwner().getUsername())
                .createdAt(folder.getCreatedAt())
                .branches(branchSummaries)
                .sets(allSets) // "All" tab uses this
                .build();
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
                .branchId(fs.getBranch() != null ? fs.getBranch().getBranchId() : null)
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
    public FlashcardSetResponse createSetInFolder(Long folderId, FlashcardSetRequest request, Long branchId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        if (!folder.getOwner().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("You don't own this folder");
        }

        FolderBranch branch = null;
        if (branchId != null) {
            branch = folderBranchRepository.findById(branchId)
                    .orElseThrow(() -> new RuntimeException("Branch not found"));
        }

        // 1. Create the set
        FlashcardSet set = FlashcardSet.builder()
                .owner(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .visibility(request.getVisibility() != null ? Visibility.valueOf(request.getVisibility().toUpperCase())
                        : Visibility.PUBLIC)
                .status(ModerationStatus.PENDING)
                .isDeleted(false)
                .version(1)
                .submittedBy(user.getUserId())
                .submittedAt(java.time.LocalDateTime.now())
                .build();

        FlashcardSet savedSet = flashcardSetRepository.save(set);

        // 2. Add to folder
        FolderSet.FolderSetId id = new FolderSet.FolderSetId(folderId, savedSet.getSetId());
        FolderSet folderSet = FolderSet.builder()
                .id(id)
                .folder(folder)
                .flashcardSet(savedSet)
                .branch(branch)
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
