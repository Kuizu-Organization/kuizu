package com.kuizu.backend.repository;

import com.kuizu.backend.entity.ModerationHistory;
import com.kuizu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModerationHistoryRepository extends JpaRepository<ModerationHistory, Long> {
    List<ModerationHistory> findByModerator(User moderator);

    List<ModerationHistory> findByEntityTypeAndEntityId(String entityType, Long entityId);
}
