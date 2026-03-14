package com.kuizu.backend.service;

import com.kuizu.backend.dto.response.FolderDetailResponse;
import com.kuizu.backend.dto.response.FolderResponse;
import com.kuizu.backend.entity.Folder;
import com.kuizu.backend.entity.FolderSet;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.repository.FlashcardRepository;
import com.kuizu.backend.repository.FolderRepository;
import com.kuizu.backend.repository.FolderSetRepository;
import com.kuizu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolderService {

    private final FolderRepository folderRepository;
    private final FolderSetRepository folderSetRepository;
    private final FlashcardRepository flashcardRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<FolderResponse> getUserFolders(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Folder> folders = folderRepository.findByOwnerAndIsDeletedFalse(user);

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

        List<FolderDetailResponse.FlashcardSetSummary> sets = folderSets.stream()
                .map(fs -> {
                    var flashcardSet = fs.getFlashcardSet();
                    return FolderDetailResponse.FlashcardSetSummary.builder()
                            .setId(flashcardSet.getSetId())
                            .title(flashcardSet.getTitle())
                            .description(flashcardSet.getDescription())
                            .termCount(flashcardRepository.countByFlashcardSetAndIsDeletedFalse(flashcardSet))
                            .ownerDisplayName(flashcardSet.getOwner().getDisplayName())
                            .ownerUsername(flashcardSet.getOwner().getUsername())
                            .createdAt(flashcardSet.getCreatedAt())
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
                .sets(sets)
                .build();
    }
}
