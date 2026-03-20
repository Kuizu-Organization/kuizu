package com.kuizu.backend.repository;

import com.kuizu.backend.entity.Class;
import com.kuizu.backend.entity.enumeration.ModerationStatus;
import com.kuizu.backend.entity.enumeration.Visibility;
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

    List<Class> findByClassNameContainingIgnoreCaseAndVisibilityAndStatus(String name, Visibility visibility,
            ModerationStatus status);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM classes WHERE visibility = 'PUBLIC' AND status = 'ACTIVE' ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Class> findRandomPublicClasses(@org.springframework.data.repository.query.Param("limit") int limit);
}
