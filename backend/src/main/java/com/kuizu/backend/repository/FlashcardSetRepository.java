package com.kuizu.backend.repository;

import com.kuizu.backend.entity.FlashcardSet;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.entity.enumeration.Visibility;
import com.kuizu.backend.entity.enumeration.ModerationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardSetRepository extends JpaRepository<FlashcardSet, Long> {
    List<FlashcardSet> findByOwnerAndIsDeletedFalse(User owner);

    List<FlashcardSet> findByVisibilityAndIsDeletedFalse(Visibility visibility);

    List<FlashcardSet> findByStatusAndIsDeletedFalse(ModerationStatus status);
    java.util.Optional<FlashcardSet> findByTitle(String title);
    List<FlashcardSet> findByStatus(String status);

    @Query("SELECT s FROM FlashcardSet s WHERE (s.owner = :owner OR s.visibility = com.kuizu.backend.entity.enumeration.Visibility.PUBLIC) AND (s.isDeleted = false OR s.isDeleted IS NULL)")
    List<FlashcardSet> findAllAvailableForUser(@Param("owner") User owner);
}
