package com.kuizu.backend.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RateLimiterService {

    private final Cache<String, Integer> forgotPasswordCache;
    private final Cache<String, Integer> loginAttemptCache;
    private final Cache<String, Long> otpCooldownCache;
    private final Cache<String, Integer> otpAttemptCache;

    public RateLimiterService() {
        this.forgotPasswordCache = Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .build();

        this.loginAttemptCache = Caffeine.newBuilder()
                .expireAfterWrite(15, TimeUnit.MINUTES)
                .build();

        this.otpCooldownCache = Caffeine.newBuilder()
                .expireAfterWrite(60, TimeUnit.SECONDS)
                .build();

        this.otpAttemptCache = Caffeine.newBuilder()
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

    public String getOtpRateLimitStatus(String email) {
        Integer attempts = otpAttemptCache.getIfPresent(email);
        if (attempts != null && attempts >= 3) {
            return "BLOCKED";
        }
        // Allow the first resend immediately (attempts will be 1 if initial OTP was sent)
        if (attempts != null && attempts >= 2 && otpCooldownCache.getIfPresent(email) != null) {
            return "COOLDOWN";
        }
        return "ALLOWED";
    }

    public void registerOtpRequest(String email) {
        Integer attempts = otpAttemptCache.getIfPresent(email);
        otpAttemptCache.put(email, (attempts == null ? 0 : attempts) + 1);
        otpCooldownCache.put(email, System.currentTimeMillis());
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
