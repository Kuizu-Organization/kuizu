package com.kuizu.backend.repository;

import com.kuizu.backend.entity.ClassFolder;
import com.kuizu.backend.entity.StudyClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassFolderRepository extends JpaRepository<ClassFolder, ClassFolder.ClassFolderId> {
    List<ClassFolder> findByStudyClass(StudyClass studyClass);
}
