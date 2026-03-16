package com.kuizu.backend.entity;

import com.kuizu.backend.entity.enumeration.Visibility;
import com.kuizu.backend.entity.enumeration.ModerationStatus;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "classes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Class {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_id")
    private Long classId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "class_name", length = 255)
    private String className;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "join_code", length = 50)
    private String joinCode;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Visibility visibility;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ModerationStatus status;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "moderated_by", length = 36)
    private String moderatedBy;

    @Column(name = "moderated_at")
    private LocalDateTime moderatedAt;

    @Column(name = "moderation_notes", columnDefinition = "TEXT")
    private String moderationNotes;

    @Column(name = "submitted_by", length = 36)
    private String submittedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "clazz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ClassMember> classMembers = new ArrayList<>();

    @OneToMany(mappedBy = "clazz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ClassInvite> classInvites = new ArrayList<>();

    @OneToMany(mappedBy = "clazz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ClassMaterial> classMaterials = new ArrayList<>();

    @OneToMany(mappedBy = "clazz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ClassJoinRequest> classJoinRequests = new ArrayList<>();
}
