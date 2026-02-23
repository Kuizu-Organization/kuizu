package com.kuizu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "progress_id")
    private Long progressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Flashcard flashcard;

    @Column(name = "mastery_level")
    private Integer masteryLevel;

    @Column(name = "streak")
    private Integer streak;

    @Column(name = "reset_count")
    private Integer resetCount;

    @Column(name = "last_studied_at")
    private LocalDateTime lastStudiedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
