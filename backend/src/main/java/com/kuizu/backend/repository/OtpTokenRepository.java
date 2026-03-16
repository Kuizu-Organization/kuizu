package com.kuizu.backend.repository;

import com.kuizu.backend.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findByEmailAndOtpCodeAndAction(String email, String otpCode, String action);
    Iterable<OtpToken> findByEmailAndActionAndUsedAtIsNull(String email, String action);
}
