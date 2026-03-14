package com.kuizu.backend.controller;

import com.kuizu.backend.dto.request.CreateFolderRequest;
import com.kuizu.backend.service.FolderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

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
}

