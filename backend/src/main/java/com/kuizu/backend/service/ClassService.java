package com.kuizu.backend.service;

import com.kuizu.backend.dto.response.ClassInfoResponse;
import com.kuizu.backend.dto.response.ClassMaterialResponse;
import com.kuizu.backend.dto.response.ClassResponse;
import com.kuizu.backend.entity.Class;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.repository.ClassRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassService {
    ClassRepository classRepository;

    public ClassService(ClassRepository classRepository) {
        this.classRepository = classRepository;
    }

    public ClassInfoResponse findClassById(Long classId) {
        Class clazz = classRepository.findByClassId(classId).orElseThrow(() -> new ApiException("Class not found with id: " + classId));
        List<ClassMaterialResponse> classMaterialResponseList = clazz.getClassMaterials()
                .stream()
                .map(m -> new ClassMaterialResponse(
                        m.getMaterialId(),
                        m.getMaterialType(),
                        m.getMaterialRefId()
                )).toList();

        return new ClassInfoResponse(
                clazz.getClassId(),
                clazz.getOwner().getUserId(),
                clazz.getOwner().getDisplayName(),
                clazz.getClassName(),
                clazz.getDescription(),
                classMaterialResponseList
        );
    }

    public List<ClassResponse> findClassesByName(String name) {
        return classRepository.findByClassNameContainingIgnoreCase(name)
                .stream()
                .map(c -> new ClassResponse(
                        c.getClassId(),
                        c.getOwner().getUserId(),
                        c.getOwner().getDisplayName(),
                        c.getClassName(),
                        c.getDescription()
                ))
                .toList();
    }
}
