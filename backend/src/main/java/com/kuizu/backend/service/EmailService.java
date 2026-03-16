package com.kuizu.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    @Value("${emailjs.service.id:}")
    private String serviceId;

    @Value("${emailjs.template.id:}")
    private String templateId;

    @Value("${emailjs.public.key:}")
    private String publicKey;

    @Value("${emailjs.private.key:}")
    private String privateKey;

    public void sendOtpEmail(String toEmail, String toName, String otpCode, String action) {
        if (serviceId.isEmpty() || templateId.isEmpty() || publicKey.isEmpty()) {
            System.out.println("EmailJS is not configured. Falling back to console logging.");
            System.out.println("SIMULATED EMAIL TO " + toEmail + " | Action: " + action + " | OTP: " + otpCode);
            return;
        }

        RestTemplate restTemplate = new RestTemplate();
        String url = "https://api.emailjs.com/api/v1.0/email/send";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> templateParams = new HashMap<>();
        templateParams.put("to_email", toEmail);
        templateParams.put("to_name", toName);
        templateParams.put("otp_code", otpCode);
        templateParams.put("action", action);

        Map<String, Object> body = new HashMap<>();
        body.put("service_id", serviceId);
        body.put("template_id", templateId);
        body.put("user_id", publicKey);
        if (privateKey != null && !privateKey.isEmpty()) {
            body.put("accessToken", privateKey);
        }
        body.put("template_params", templateParams);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, request, String.class);
            System.out.println("Email sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email via EmailJS: " + e.getMessage());
            // If it fails, fallback to logging
            System.out.println("SIMULATED EMAIL TO " + toEmail + " | Action: " + action + " | OTP: " + otpCode);
        }
    }
}
