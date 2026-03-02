package com.kuizu.backend.controller;

import com.kuizu.backend.service.ClassService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/classes")
class ClassController {
    private final ClassService classService;

    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    @GetMapping("/{classId}")
    public ResponseEntity<?> getClass(Long classId) {
        return ResponseEntity.ok(classService.findClassById(classId));
    }

    @GetMapping("/search")
    public ResponseEntity<?> getClassesByName(@RequestParam String query) {
        return ResponseEntity.ok(classService.findClassesByName(query));
    }

}
