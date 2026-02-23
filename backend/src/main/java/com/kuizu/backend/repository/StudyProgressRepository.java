package com.kuizu.backend.repository;

import com.kuizu.backend.entity.Flashcard;
import com.kuizu.backend.entity.StudyProgress;
import com.kuizu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyProgressRepository extends JpaRepository<StudyProgress, Long> {
    Optional<StudyProgress> findByUserAndFlashcard(User user, Flashcard flashcard);
    List<StudyProgress> findByUser(User user);
}
