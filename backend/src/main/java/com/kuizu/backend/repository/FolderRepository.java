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

    List<Folder> findByNameContainingIgnoreCaseAndVisibilityAndIsDeletedFalse(String name, String visibility);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM folders WHERE visibility = 'PUBLIC' AND is_deleted = false ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Folder> findRandomPublicFolders(@org.springframework.data.repository.query.Param("limit") int limit);
}
