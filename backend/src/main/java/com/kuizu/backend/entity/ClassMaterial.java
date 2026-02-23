package com.kuizu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "class_materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "material_id")
    private Long materialId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private StudyClass studyClass;

    @Column(name = "material_type", length = 20)
    private String materialType;

    @Column(name = "material_ref_id")
    private Long materialRefId;

    @Column(name = "added_by", length = 36)
    private String addedBy;

    @CreationTimestamp
    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    @Column(columnDefinition = "TEXT")
    private String metadata;
}
