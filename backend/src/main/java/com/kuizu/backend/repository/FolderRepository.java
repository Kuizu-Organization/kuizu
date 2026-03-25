package com.kuizu.backend.repository;

import com.kuizu.backend.entity.Folder;
import com.kuizu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByOwnerAndIsDeletedFalse(User owner);
    List<Folder> findByVisibilityAndIsDeletedFalse(String visibility);
    List<Folder> findByVisibilityAndIsDeletedFalseAndOwnerNot(String visibility, User owner);
    java.util.Optional<Folder> findByFolderIdAndIsDeletedFalse(Long folderId);
    boolean existsByNameAndOwnerAndIsDeletedFalse(String name, User owner);
    java.util.Optional<Folder> findByNameAndOwnerAndIsDeletedFalse(String name, User owner);
}

