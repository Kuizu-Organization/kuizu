package com.kuizu.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "flashcard_set_statistics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardSetStatistic {

    @Id
    @Column(name = "set_id")
    private Long setId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "set_id")
    private FlashcardSet flashcardSet;

    @Column(name = "view_count")
    private Long viewCount;

    @Column(name = "quiz_count")
    private Long quizCount;

    @Column(name = "retention_rate")
    private BigDecimal retentionRate;

    @Column(name = "last_viewed_at")
    private LocalDateTime lastViewedAt;
}
