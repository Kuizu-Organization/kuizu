package com.kuizu.backend.repository;

import com.kuizu.backend.entity.ClassMaterial;
import com.kuizu.backend.entity.StudyClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassMaterialRepository extends JpaRepository<ClassMaterial, Long> {
    List<ClassMaterial> findByStudyClass(StudyClass studyClass);
}
