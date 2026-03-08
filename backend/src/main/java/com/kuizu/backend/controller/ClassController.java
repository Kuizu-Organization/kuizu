package com.kuizu.backend.controller;

import com.kuizu.backend.service.ClassService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.kuizu.backend.dto.request.JoinClassRequest;
import com.kuizu.backend.dto.request.CreateClassRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import java.security.Principal;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/classes")
class ClassController {
    private final ClassService classService;

    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    @GetMapping("/{classId}")
    public ResponseEntity<?> getClass(@PathVariable Long classId, Principal principal) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(classService.findClassById(classId, username));
    }

    @GetMapping("/search")
    public ResponseEntity<?> getClassesByName(@RequestParam String query) {
        return ResponseEntity.ok(classService.findClassesByName(query));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyClasses(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(classService.getUserClasses(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<?> createClass(@RequestBody CreateClassRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(classService.createClass(request, principal.getName()));
    }

    @PostMapping("/{classId}/join")
    public ResponseEntity<?> joinClass(@PathVariable Long classId, @RequestBody JoinClassRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        classService.joinClass(classId, principal.getName(), request.getJoinCode(), request.getMessage());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Join request processed");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{classId}/leave")
    public ResponseEntity<?> leaveClass(@PathVariable Long classId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        classService.leaveClass(classId, principal.getName());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Successfully left the class");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{classId}/join-code")
    public ResponseEntity<?> getJoinCode(@PathVariable Long classId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String joinCode = classService.getJoinCode(classId, principal.getName());
        
        Map<String, String> response = new HashMap<>();
        response.put("joinCode", joinCode);
        return ResponseEntity.ok(response);
    }
}
