package com.kuizu.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "class_folders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassFolder {

    @EmbeddedId
    private ClassFolderId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("classId")
    @JoinColumn(name = "class_id")
    private StudyClass studyClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("folderId")
    @JoinColumn(name = "folder_id")
    private Folder folder;

    @Column(name = "added_by", length = 36)
    private String addedBy;

    @CreationTimestamp
    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class ClassFolderId implements Serializable {
        @Column(name = "class_id")
        private Long classId;

        @Column(name = "folder_id")
        private Long folderId;
    }
}
