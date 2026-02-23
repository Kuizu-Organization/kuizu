package com.kuizu.backend.repository;

import com.kuizu.backend.entity.ClassInvite;
import com.kuizu.backend.entity.StudyClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassInviteRepository extends JpaRepository<ClassInvite, Long> {
    Optional<ClassInvite> findByToken(String token);
    Optional<ClassInvite> findByStudyClassAndEmail(StudyClass studyClass, String email);
}
