package com.kuizu.backend.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RateLimiterService {

    private final Cache<String, Integer> forgotPasswordCache;
    private final Cache<String, Integer> loginAttemptCache;

    public RateLimiterService() {
        this.forgotPasswordCache = Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .build();

        this.loginAttemptCache = Caffeine.newBuilder()
                .expireAfterWrite(15, TimeUnit.MINUTES)
                .build();
    }

    public boolean isForgotPasswordAllowed(String email) {
        Integer attempts = forgotPasswordCache.getIfPresent(email);
        return attempts == null || attempts < 3;
    }

    public void registerForgotPasswordAttempt(String email) {
        Integer attempts = forgotPasswordCache.getIfPresent(email);
        forgotPasswordCache.put(email, (attempts == null ? 0 : attempts) + 1);
    }

    public boolean isLoginAllowed(String key) {
        Integer attempts = loginAttemptCache.getIfPresent(key);
        return attempts == null || attempts < 5; // Default 5 attempts per 15 mins
    }

    public void registerLoginFailedAttempt(String key) {
        Integer attempts = loginAttemptCache.getIfPresent(key);
        loginAttemptCache.put(key, (attempts == null ? 0 : attempts) + 1);
    }

    public void resetLoginAttempts(String key) {
        loginAttemptCache.invalidate(key);
    }
}
