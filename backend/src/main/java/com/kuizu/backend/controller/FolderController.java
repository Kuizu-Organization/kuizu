package com.kuizu.backend.controller;

import com.kuizu.backend.dto.request.CreateFolderRequest;
import com.kuizu.backend.dto.request.UpdateFolderRequest;
import com.kuizu.backend.service.FolderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    @PostMapping
    public ResponseEntity<?> createFolder(@Valid @RequestBody CreateFolderRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(folderService.createFolder(request, principal.getName()));
    }

    @PutMapping("/{folderId}")
    public ResponseEntity<?> updateFolder(@PathVariable Long folderId, @Valid @RequestBody UpdateFolderRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(folderService.updateFolder(folderId, request, principal.getName()));
    }

    @DeleteMapping("/{folderId}")
    public ResponseEntity<?> deleteFolder(@PathVariable Long folderId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        folderService.deleteFolder(folderId, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Folder deleted successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyFolders(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(folderService.getUserFolders(principal.getName()));
    }

    @GetMapping("/public")
    public ResponseEntity<?> getPublicFolders(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(folderService.getPublicFolders(principal.getName()));
    }

    @GetMapping("/{folderId}")
    public ResponseEntity<?> getFolderDetail(@PathVariable Long folderId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(folderService.getFolderDetail(folderId, principal.getName()));
    }

    @GetMapping("/{folderId}/available-sets")
    public ResponseEntity<?> getAvailableSets(@PathVariable Long folderId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(folderService.getAvailableSets(folderId, principal.getName()));
    }

    @GetMapping("/my-sets")
    public ResponseEntity<?> getMySets(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(folderService.getUserFlashcardSets(principal.getName()));
    }

    @PostMapping("/{folderId}/sets/{setId}")
    public ResponseEntity<?> addSetToFolder(@PathVariable Long folderId, @PathVariable Long setId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        folderService.addSetToFolder(folderId, setId, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Set added to folder successfully"));
    }

    @DeleteMapping("/{folderId}/sets/{setId}")
    public ResponseEntity<?> removeSetFromFolder(@PathVariable Long folderId, @PathVariable Long setId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        folderService.removeSetFromFolder(folderId, setId, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Set removed from folder successfully"));
    }
}
