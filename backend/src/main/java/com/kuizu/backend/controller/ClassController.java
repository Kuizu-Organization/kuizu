package com.kuizu.backend.controller;

import com.kuizu.backend.service.ClassService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import java.security.Principal;

@RestController
@RequestMapping("/api/classes")
class ClassController {
    private final ClassService classService;

    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    @GetMapping("/{classId}")
    public ResponseEntity<?> getClass(@PathVariable Long classId) {
        return ResponseEntity.ok(classService.findClassById(classId));
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

}
