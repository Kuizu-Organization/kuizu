package com.kuizu.backend.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FolderResponse {
    private Long folderId;
    private String name;
    private String description;
    private String visibility;
    private long setCount;
    private String ownerDisplayName;
    private LocalDateTime createdAt;
}
