package com.kuizu.backend.repository;

import com.kuizu.backend.entity.FlashcardSet;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.entity.enumeration.Visibility;
import com.kuizu.backend.entity.enumeration.ModerationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardSetRepository extends JpaRepository<FlashcardSet, Long> {
    List<FlashcardSet> findByOwnerAndIsDeletedFalse(User owner);

    List<FlashcardSet> findByVisibilityAndIsDeletedFalse(Visibility visibility);

    List<FlashcardSet> findByStatusAndIsDeletedFalse(ModerationStatus status);

    
    List<FlashcardSet> findByTitleContainingIgnoreCaseAndVisibilityAndStatusAndIsDeletedFalse(String title,
            Visibility visibility, ModerationStatus status);

    List<FlashcardSet> findByVisibilityAndStatusAndIsDeletedFalse(Visibility visibility, ModerationStatus status);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM flashcard_sets WHERE visibility = 'PUBLIC' AND status = 'APPROVED' AND is_deleted = false ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<FlashcardSet> findRandomPublicSets(@org.springframework.data.repository.query.Param("limit") int limit);
    java.util.Optional<FlashcardSet> findByTitle(String title);
}