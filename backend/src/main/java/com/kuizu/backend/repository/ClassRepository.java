package com.kuizu.backend.repository;

import com.kuizu.backend.entity.Class;
import com.kuizu.backend.entity.enumeration.ModerationStatus;
import com.kuizu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<Class, Long> {
    Optional<Class> findByClassId(Long classId);

    List<Class> findByOwner(User owner);

    Optional<Class> findByJoinCode(String joinCode);

    List<Class> findByClassNameContainingIgnoreCase(String name);

    List<Class> findByStatus(ModerationStatus status);
}
