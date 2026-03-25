package com.kuizu.backend.repository;

import com.kuizu.backend.entity.Folder;
import com.kuizu.backend.entity.FolderBranch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderBranchRepository extends JpaRepository<FolderBranch, Long> {
    List<FolderBranch> findByFolderAndIsDeletedFalse(Folder folder);
}
