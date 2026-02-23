package com.kuizu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "class_statistics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassStatistic {

    @Id
    @Column(name = "class_id")
    private Long classId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "class_id")
    private StudyClass studyClass;

    @Column(name = "member_count")
    private Long memberCount;

    @Column(name = "material_count")
    private Long materialCount;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
