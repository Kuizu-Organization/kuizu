package com.kuizu.backend.service;

import com.kuizu.backend.entity.User;
import com.kuizu.backend.entity.UserSession;
import com.kuizu.backend.repository.UserSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class SessionService {

    @Autowired
    private UserSessionRepository userSessionRepository;

    public UserSession createSession(User user, HttpServletRequest request) {
        String token = UUID.randomUUID().toString();
        UserSession session = UserSession.builder()
                .user(user)
                .sessionToken(token)
                .ipAddress(request.getRemoteAddr())
                .userAgent(request.getHeader("User-Agent"))
                .lastActiveAt(LocalDateTime.now())
                .build();
        return userSessionRepository.save(session);
    }

    public Optional<UserSession> getSession(String token) {
        return userSessionRepository.findBySessionToken(token)
                .filter(session -> session.getRevokedAt() == null);
    }

    public void updateActive(UserSession session) {
        session.setLastActiveAt(LocalDateTime.now());
        userSessionRepository.save(session);
    }

    public void revokeSession(String token) {
        userSessionRepository.findBySessionToken(token).ifPresent(session -> {
            session.setRevokedAt(LocalDateTime.now());
            userSessionRepository.save(session);
        });
    }
}
