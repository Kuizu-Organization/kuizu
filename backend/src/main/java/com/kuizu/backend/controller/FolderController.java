package com.kuizu.backend.controller;

import com.kuizu.backend.service.FolderService;
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

    @GetMapping("/me")
    public ResponseEntity<?> getMyFolders(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(folderService.getUserFolders(principal.getName()));
    }

    @GetMapping("/{folderId}")
    public ResponseEntity<?> getFolderDetail(@PathVariable Long folderId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(folderService.getFolderDetail(folderId, principal.getName()));
    }
}
