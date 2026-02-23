package com.kuizu.backend.repository;

import com.kuizu.backend.entity.StudyClass;
import com.kuizu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyClassRepository extends JpaRepository<StudyClass, Long> {
    List<StudyClass> findByOwner(User owner);
    Optional<StudyClass> findByJoinCode(String joinCode);
}
