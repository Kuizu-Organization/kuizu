package com.kuizu.backend.service;

import com.kuizu.backend.dto.response.ClassMaterialResponse;
import com.kuizu.backend.repository.ClassMaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
class ClassMaterialService {
    ClassMaterialRepository classMaterialRepository;

    public ClassMaterialService(ClassMaterialRepository classMaterialRepository) {
        this.classMaterialRepository = classMaterialRepository;
    }

    public List<ClassMaterialResponse> findMaterialsByClassId(Long classId) {
        return classMaterialRepository.findByClazz_ClassId(classId)
                .stream()
                .map(m -> new ClassMaterialResponse(
                        m.getMaterialId(),
                        m.getMaterialType(),
                        m.getMaterialRefId()
                ))
                .toList();
    }
}
