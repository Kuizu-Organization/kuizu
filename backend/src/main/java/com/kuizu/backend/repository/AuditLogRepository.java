package com.kuizu.backend.repository;

import com.kuizu.backend.entity.AuditLog;
import com.kuizu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUser(User user);
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId);
}
