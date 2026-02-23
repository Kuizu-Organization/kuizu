package com.kuizu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "class_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassMember {

    @EmbeddedId
    private ClassMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("classId")
    @JoinColumn(name = "class_id")
    private StudyClass studyClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 20)
    private String role;

    @Column(name = "joined_by", length = 36)
    private String joinedBy;

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class ClassMemberId implements Serializable {
        @Column(name = "class_id")
        private Long classId;

        @Column(name = "user_id")
        private String userId;
    }
}
