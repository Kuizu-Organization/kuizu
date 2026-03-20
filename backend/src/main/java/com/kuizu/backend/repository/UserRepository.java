package com.kuizu.backend.repository;

import com.kuizu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<User> findByUsernameAndStatusNot(String username, User.UserStatus status);

    @Query("SELECT u FROM User u WHERE (LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND u.status != :status")
    Page<User> searchUsers(@Param("query") String query, @Param("status") User.UserStatus status, Pageable pageable);

    List<User> findByRole(User.UserRole role);
}
