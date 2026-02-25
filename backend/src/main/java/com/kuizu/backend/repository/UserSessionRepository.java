package com.kuizu.backend.repository;

import com.kuizu.backend.entity.User;
import com.kuizu.backend.entity.UserSession;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    @EntityGraph(attributePaths = { "user" })
    Optional<UserSession> findBySessionToken(String sessionToken);

    @EntityGraph(attributePaths = { "user" })
    List<UserSession> findByUserAndRevokedAtIsNull(User user);
}
