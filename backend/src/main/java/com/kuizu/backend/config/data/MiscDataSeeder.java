package com.kuizu.backend.config.data;

import com.kuizu.backend.entity.*;
import com.kuizu.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class MiscDataSeeder {
    private final FolderRepository folderRepository;
    private final FolderSetRepository folderSetRepository;
    private final FlashcardSetStatisticRepository flashcardSetStatisticRepository;
    private final UserStatisticRepository userStatisticRepository;
    private final AuditLogRepository auditLogRepository;
    private final ModerationHistoryRepository moderationHistoryRepository;
    private final SystemStatisticRepository systemStatisticRepository;
    private final UserSeeder userSeeder;
    private final FlashcardSetSeeder flashcardSetSeeder;

    public void seed() {
        if (folderRepository.count() > 0) return;

        User profJohn = userSeeder.getUser("prof_john");
        User drSarah = userSeeder.getUser("dr_sarah");
        User mrsDavis = userSeeder.getUser("mrs_davis");

        // --- Folders ---
        Folder profJohnFolder = Folder.builder()
                .owner(profJohn)
                .name("Computer Science Basics")
                .description("Fundamental resources for all CS classes.")
                .visibility("PUBLIC")
                .isDeleted(false)
                .createdAt(LocalDateTime.now().minusDays(10))
                .build();
        folderRepository.save(profJohnFolder);

        Folder drSarahFolder = Folder.builder()
                .owner(drSarah)
                .name("General Sciences")
                .description("Basic science handouts and notes.")
                .visibility("PUBLIC")
                .isDeleted(false)
                .createdAt(LocalDateTime.now().minusDays(10))
                .build();
        folderRepository.save(drSarahFolder);

        Folder humanitiesFolder = Folder.builder()
                .owner(mrsDavis)
                .name("Humanities & Liberal Arts")
                .description("A curated list for history and literature.")
                .visibility("PUBLIC")
                .isDeleted(false)
                .createdAt(LocalDateTime.now().minusDays(12))
                .build();
        folderRepository.save(humanitiesFolder);

        Folder chemistryFolder = Folder.builder()
                .owner(drSarah)
                .name("Advanced Chemistry Notes")
                .description("Detailed resources for the organic chemistry lab.")
                .visibility("PRIVATE")
                .isDeleted(false)
                .createdAt(LocalDateTime.now().minusDays(5))
                .build();
        folderRepository.save(chemistryFolder);

        Folder itFolder = Folder.builder()
                .owner(profJohn)
                .name("IT Core Concepts")
                .description("Comp-sci core material.")
                .visibility("PUBLIC")
                .isDeleted(false)
                .createdAt(LocalDateTime.now().minusDays(8))
                .build();
        folderRepository.save(itFolder);

        // --- Folder-Set Mappings ---
        mapSetToFolder("Java Collections Framework", profJohnFolder, profJohn);
        mapSetToFolder("React Hooks Overview", profJohnFolder, profJohn);
        mapSetToFolder("Introduction to Chemical Bonding", chemistryFolder, drSarah);
        mapSetToFolder("World War I Causes", humanitiesFolder, mrsDavis);
        mapSetToFolder("Advanced SQL Techniques", itFolder, profJohn);
        mapSetToFolder("Cellular Processes", drSarahFolder, drSarah);
        mapSetToFolder("Introduction to Sociology Concepts", humanitiesFolder, mrsDavis);

        // --- Flashcard Set Statistics ---
        seedSetStatistic("Java Collections Framework", 250, 60, 88.5);
        seedSetStatistic("React Hooks Overview", 180, 45, 75.0);
        seedSetStatistic("Introduction to Chemical Bonding", 320, 80, 92.0);
        seedSetStatistic("Classical Mechanics", 150, 20, 80.0);
        seedSetStatistic("Basic Psychology", 400, 110, 95.0);
        seedSetStatistic("Common Music Symbols", 120, 30, 70.0);
        seedSetStatistic("World War I Causes", 210, 55, 87.0);

        // --- User Statistics ---
        seedUserStatistic("prof_john", 5, 25, 12, 90.0);
        seedUserStatistic("dr_sarah", 4, 20, 10, 85.0);
        seedUserStatistic("mrs_davis", 3, 15, 8, 88.0);
        seedUserStatistic("prof_brown", 2, 10, 5, 92.0);
        seedUserStatistic("mrs_lee", 2, 12, 6, 89.0);
        
        // Student Stats
        seedUserStatistic("alice_j", 1, 3, 25, 85.0);
        seedUserStatistic("bob_w", 0, 0, 40, 78.0);
        seedUserStatistic("charlie_b", 0, 0, 15, 95.0);
        seedUserStatistic("david_m", 0, 0, 22, 70.0);
        seedUserStatistic("eva_g", 0, 0, 55, 91.0);
        seedUserStatistic("frank_h", 0, 0, 30, 88.0);
        seedUserStatistic("grace_l", 0, 0, 12, 82.0);
        seedUserStatistic("henry_k", 0, 0, 10, 80.0);
        seedUserStatistic("isabel_c", 0, 0, 5, 94.0);
        seedUserStatistic("leo_t", 0, 0, 18, 86.0);
        seedUserStatistic("olivia_b", 0, 0, 7, 83.0);
        seedUserStatistic("paul_s", 0, 0, 2, 65.0);

        // --- Audit Logs ---
        auditLogRepository.save(AuditLog.builder()
                .user(userSeeder.getUser("admin"))
                .action("SYSTEM_CONFIG_UPDATE")
                .entityType("SYSTEM")
                .entityId(0L)
                .details("Admin updated global system settings.")
                .createdAt(LocalDateTime.now().minusHours(5))
                .build());

        // --- Moderation History ---
        seedModeration("SET", "java-collections", "APPROVE", "High quality content.", 3);
        seedModeration("SET", "react-hooks", "REJECT", "Needs more information.", 5);
        seedModeration("CLASS", "algo-101", "APPROVE", "Correct syllabus.", 10);
        seedModeration("SET", "sql-adv", "APPROVE", "Excellent coverage.", 2);
        seedModeration("CLASS", "psych-101", "REJECT", "Incomplete description.", 4);
        seedModeration("SET", "chemistry-bonding", "APPROVE", "Good visuals.", 6);
        seedModeration("SET", "biology-cells", "APPROVE", "Accurate data.", 1);
        seedModeration("CLASS", "history-world", "APPROVE", "Comprehensive timeline.", 8);
        seedModeration("SET", "physics-mechanics", "APPROVE", "Clear formulas.", 7);
        seedModeration("SET", "philosophy-intro", "REJECT", "Off-topic content found.", 3);
        seedModeration("SET", "french-phrases", "APPROVE", "Perfect for beginners.", 2);
        seedModeration("CLASS", "marketing-101", "APPROVE", "Practical examples provided.", 9);
        seedModeration("SET", "sociology-concepts", "PENDING", "Waiting for senior review.", 1);

        // --- System Statistic ---
        systemStatisticRepository.save(SystemStatistic.builder().statKey("total_users").statValue(20L).build());
        systemStatisticRepository.save(SystemStatistic.builder().statKey("total_active_classes").statValue(12L).build());
        systemStatisticRepository.save(SystemStatistic.builder().statKey("total_flashcard_sets").statValue(25L).build());
        systemStatisticRepository.save(SystemStatistic.builder().statKey("total_folders").statValue(5L).build());
    }

    private void mapSetToFolder(String setTitle, Folder folder, User user) {
        FlashcardSet set = flashcardSetSeeder.getSet(setTitle);
        if (set != null && folder != null) {
            folderSetRepository.save(FolderSet.builder()
                    .id(new FolderSet.FolderSetId(folder.getFolderId(), set.getSetId()))
                    .folder(folder)
                    .flashcardSet(set)
                    .addedAt(LocalDateTime.now().minusDays(1))
                    .addedBy(user.getUserId())
                    .build());
        }
    }

    private void seedSetStatistic(String title, int views, int quizzes, double retention) {
        FlashcardSet set = flashcardSetSeeder.getSet(title);
        if (set == null) return;
        flashcardSetStatisticRepository.save(FlashcardSetStatistic.builder()
                .setId(set.getSetId())
                .flashcardSet(set)
                .viewCount((long) views)
                .quizCount((long) quizzes)
                .retentionRate(java.math.BigDecimal.valueOf(retention))
                .lastViewedAt(LocalDateTime.now().minusMinutes(30))
                .build());
    }

    private void seedUserStatistic(String username, int sets, int cards, int quizzes, double avgScore) {
        User user = userSeeder.getUser(username);
        if (user == null) return;
        userStatisticRepository.save(UserStatistic.builder()
                .userId(user.getUserId())
                .user(user)
                .totalSets((long) sets)
                .totalCards((long) cards)
                .quizzesTaken((long) quizzes)
                .avgScore(java.math.BigDecimal.valueOf(avgScore))
                .lastActiveAt(LocalDateTime.now())
                .build());
    }

    private void seedModeration(String type, String entityId, String action, String notes, int daysAgo) {
        moderationHistoryRepository.save(ModerationHistory.builder()
                .moderator(userSeeder.getUser("admin"))
                .entityType(type)
                .entityId(entityId)
                .action(action)
                .notes(notes)
                .createdAt(LocalDateTime.now().minusDays(daysAgo))
                .build());
    }
}
