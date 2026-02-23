package com.kuizu.backend.repository;

import com.kuizu.backend.entity.FlashcardSet;
import com.kuizu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardSetRepository extends JpaRepository<FlashcardSet, Long> {
    List<FlashcardSet> findByOwnerAndIsDeletedFalse(User owner);
    List<FlashcardSet> findByVisibilityAndIsDeletedFalse(String visibility);
}
