package com.kuizu.backend.service;

import com.kuizu.backend.dto.response.NotificationResponse;
import com.kuizu.backend.entity.Notification;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.repository.NotificationRepository;
import com.kuizu.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public List<NotificationResponse> getMyNotifications(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found"));
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found"));
        return notificationRepository.countByRecipientAndReadFalse(user);
    }

    @Transactional
    public void markAsRead(String username, String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ApiException("Notification not found"));
        
        if (!notification.getRecipient().getUsername().equals(username)) {
            throw new ApiException("You do not have permission to access this notification");
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found"));
        List<Notification> unread = notificationRepository.findByRecipientAndReadFalseOrderByCreatedAtDesc(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void sendNotification(User recipient, String title, String content, String type, String relatedId) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .content(content)
                .type(type)
                .relatedId(relatedId)
                .read(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyAdmins(String title, String content, String relatedId) {
        List<User> admins = userRepository.findByRole(User.UserRole.ROLE_ADMIN);
        for (User admin : admins) {
            sendNotification(admin, title, content, "MODERATION", relatedId);
        }
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .notificationId(n.getNotificationId())
                .title(n.getTitle())
                .content(n.getContent())
                .type(n.getType())
                .read(n.getRead())
                .relatedId(n.getRelatedId())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
