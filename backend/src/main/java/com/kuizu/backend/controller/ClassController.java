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
import com.kuizu.backend.dto.request.UpdateClassRequest;
import com.kuizu.backend.dto.request.JoinRequestAction;
import com.kuizu.backend.dto.request.AddClassMaterialRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PutMapping;
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

    @PutMapping("/{classId}")
    public ResponseEntity<?> updateClass(@PathVariable Long classId, @RequestBody UpdateClassRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(classService.updateClass(classId, request, principal.getName()));
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

    @DeleteMapping("/{classId}")
    public ResponseEntity<?> deleteClass(@PathVariable Long classId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        classService.deleteClass(classId, principal.getName());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Class deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{classId}/re-request")
    public ResponseEntity<?> reRequestReview(@PathVariable Long classId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(classService.reRequestReview(classId, principal.getName()));
    }

    @DeleteMapping("/{classId}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Long classId, @PathVariable String userId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        classService.removeMember(classId, userId, principal.getName());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Member removed successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{classId}/join-requests/{requestId}/process")
    public ResponseEntity<?> processJoinRequest(@PathVariable Long classId, @PathVariable Long requestId, @RequestBody JoinRequestAction action, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        classService.processJoinRequest(classId, requestId, action, principal.getName());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Join request processed successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{classId}/materials")
    public ResponseEntity<?> addMaterial(@PathVariable Long classId, @Valid @RequestBody AddClassMaterialRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(classService.addMaterial(classId, request, principal.getName()));
    }

    @DeleteMapping("/{classId}/materials/{materialId}")
    public ResponseEntity<?> removeMaterial(@PathVariable Long classId, @PathVariable Long materialId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        classService.removeMaterial(classId, materialId, principal.getName());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Material removed successfully");
        return ResponseEntity.ok(response);
    }
}
