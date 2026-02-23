package com.kuizu.backend.repository;

import com.kuizu.backend.entity.Flashcard;
import com.kuizu.backend.entity.FlashcardSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findByFlashcardSetAndIsDeletedFalseOrderByOrderIndexAsc(FlashcardSet set);
}
