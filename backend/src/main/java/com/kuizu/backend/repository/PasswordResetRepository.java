package com.kuizu.backend.repository;

import com.kuizu.backend.entity.PasswordReset;
import com.kuizu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    Optional<PasswordReset> findByResetToken(String resetToken);
    Optional<PasswordReset> findByUserAndUsedAtIsNull(User user);
}
