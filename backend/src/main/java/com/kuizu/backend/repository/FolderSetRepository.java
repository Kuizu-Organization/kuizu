package com.kuizu.backend.repository;

import com.kuizu.backend.entity.Folder;
import com.kuizu.backend.entity.FolderSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderSetRepository extends JpaRepository<FolderSet, FolderSet.FolderSetId> {
    List<FolderSet> findByFolder(Folder folder);
}
