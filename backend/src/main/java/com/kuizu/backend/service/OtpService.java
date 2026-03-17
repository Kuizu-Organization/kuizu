package com.kuizu.backend.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    private final Cache<String, OtpData> otpCache;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OtpData {
        private String code;
        private String action;
        private LocalDateTime expiresAt;
    }

    public OtpService() {
        this.otpCache = Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .build();
    }

    public void storeOtp(String email, String code, String action) {
        String key = generateKey(email, action);
        OtpData data = OtpData.builder()
                .code(code)
                .action(action)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        otpCache.put(key, data);
    }

    public boolean verifyOtp(String email, String code, String action) {
        String key = generateKey(email, action);
        OtpData data = otpCache.getIfPresent(key);
        
        if (data != null && data.getCode().equals(code) && data.getExpiresAt().isAfter(LocalDateTime.now())) {
            otpCache.invalidate(key);
            return true;
        }
        return false;
    }

    public void invalidateOtp(String email, String action) {
        otpCache.invalidate(generateKey(email, action));
    }

    private String generateKey(String email, String action) {
        return email + ":" + action;
    }
}
