package com.kuizu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "class_invites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassInvite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invite_id")
    private Long inviteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private StudyClass studyClass;

    @Column(name = "inviter_id", length = 36)
    private String inviterId;

    @Column(length = 255)
    private String email;

    @Column(length = 255)
    private String token;

    @Column(length = 20)
    private String status;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
