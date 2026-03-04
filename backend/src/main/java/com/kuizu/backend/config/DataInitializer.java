package com.kuizu.backend.config;

import com.kuizu.backend.entity.*;
import com.kuizu.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

        private final UserRepository userRepository;
        private final ClassRepository classRepository;
        private final ClassMemberRepository classMemberRepository;
        private final FlashcardSetRepository flashcardSetRepository;
        private final FlashcardRepository flashcardRepository;
        private final FlashcardSetStatisticRepository flashcardSetStatisticRepository;
        private final FolderRepository folderRepository;
        private final FolderSetRepository folderSetRepository;
        private final ClassInviteRepository classInviteRepository;
        private final ClassJoinRequestRepository classJoinRequestRepository;
        private final ClassMaterialRepository classMaterialRepository;
        private final UserStatisticRepository userStatisticRepository;
        private final AuditLogRepository auditLogRepository;
        private final ModerationHistoryRepository moderationHistoryRepository;
        private final OAuthAccountRepository oAuthAccountRepository;
        private final PasswordResetRepository passwordResetRepository;
        private final StudyProgressRepository studyProgressRepository;
        private final SystemStatisticRepository systemStatisticRepository;
        private final UserSessionRepository userSessionRepository;
        private final PasswordEncoder passwordEncoder;

        @Bean
        @Profile("!test")
        public CommandLineRunner initData() {
                return args -> {
                        if (userRepository.count() > 0) {
                                return;
                        }

                        // --- Users ---
                        User admin = User.builder()
                                        .username("admin")
                                        .email("admin@kuizu.com")
                                        .passwordHash(passwordEncoder.encode("admin123"))
                                        .displayName("System Admin")
                                        .role(User.UserRole.ROLE_ADMIN)
                                        .status(User.UserStatus.ACTIVE)
                                        .build();

                        User teacher = User.builder()
                                        .username("teacher")
                                        .email("teacher@kuizu.com")
                                        .passwordHash(passwordEncoder.encode("teacher123"))
                                        .displayName("John Doe")
                                        .role(User.UserRole.ROLE_TEACHER)
                                        .status(User.UserStatus.ACTIVE)
                                        .build();

                        User student1 = User.builder()
                                        .username("student1")
                                        .email("student1@kuizu.com")
                                        .passwordHash(passwordEncoder.encode("student123"))
                                        .displayName("Jane Smith")
                                        .role(User.UserRole.ROLE_STUDENT)
                                        .status(User.UserStatus.ACTIVE)
                                        .build();

                        User student2 = User.builder()
                                        .username("student2")
                                        .email("student2@kuizu.com")
                                        .passwordHash(passwordEncoder.encode("student123"))
                                        .displayName("Bob Wilson")
                                        .role(User.UserRole.ROLE_STUDENT)
                                        .status(User.UserStatus.ACTIVE)
                                        .build();

                        userRepository.saveAll(List.of(admin, teacher, student1, student2));

                        // --- Classes ---
                        com.kuizu.backend.entity.Class javaClass = com.kuizu.backend.entity.Class.builder()
                                        .owner(teacher)
                                        .className("Java Programming 101")
                                        .description("Introduction to Java development concepts.")
                                        .visibility("PUBLIC")
                                        .status("ACTIVE")
                                        .joinCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                        .build();

                        com.kuizu.backend.entity.Class mathClass = com.kuizu.backend.entity.Class.builder()
                                        .owner(teacher)
                                        .className("Advanced Mathematics")
                                        .description("Calculus and Linear Algebra.")
                                        .visibility("PRIVATE")
                                        .status("ACTIVE")
                                        .joinCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                        .build();

                        classRepository.saveAll(List.of(javaClass, mathClass));

                        // --- Class Members ---
                        classMemberRepository.save(ClassMember.builder()
                                        .id(new ClassMember.ClassMemberId(javaClass.getClassId(), student1.getUserId()))
                                        .clazz(javaClass)
                                        .user(student1)
                                        .role("MEMBER")
                                        .joinedAt(LocalDateTime.now())
                                        .build());

                        classMemberRepository.save(ClassMember.builder()
                                        .id(new ClassMember.ClassMemberId(javaClass.getClassId(), student2.getUserId()))
                                        .clazz(javaClass)
                                        .user(student2)
                                        .role("MEMBER")
                                        .joinedAt(LocalDateTime.now())
                                        .build());

                        classMemberRepository.save(ClassMember.builder()
                                        .id(new ClassMember.ClassMemberId(mathClass.getClassId(), student1.getUserId()))
                                        .clazz(mathClass)
                                        .user(student1)
                                        .role("MEMBER")
                                        .joinedAt(LocalDateTime.now())
                                        .build());

                        // --- Flashcard Sets ---
                        FlashcardSet javaBasics = FlashcardSet.builder()
                                        .owner(teacher)
                                        .title("Java Basics")
                                        .description("Essential Java keywords and concepts.")
                                        .visibility("PUBLIC")
                                        .status("APPROVED")
                                        .isDeleted(false)
                                        .version(1)
                                        .build();

                        FlashcardSet calculusSum = FlashcardSet.builder()
                                        .owner(teacher)
                                        .title("Calculus Formulas")
                                        .description("Common derivatives and integrals.")
                                        .visibility("PUBLIC")
                                        .status("APPROVED")
                                        .isDeleted(false)
                                        .version(1)
                                        .build();

                        FlashcardSet englishVocab = FlashcardSet.builder()
                                        .owner(student1)
                                        .title("English Vocabulary Set 1")
                                        .description("Daily life vocabulary.")
                                        .visibility("PRIVATE")
                                        .status("DRAFT")
                                        .isDeleted(false)
                                        .version(1)
                                        .build();

                        flashcardSetRepository.saveAll(List.of(javaBasics, calculusSum, englishVocab));

                        // --- Flashcards ---
                        flashcardRepository.saveAll(List.of(
                                        Flashcard.builder().flashcardSet(javaBasics).term("JVM")
                                                        .definition("Java Virtual Machine")
                                                        .orderIndex(0).isDeleted(false).build(),
                                        Flashcard.builder().flashcardSet(javaBasics).term("JDK")
                                                        .definition("Java Development Kit")
                                                        .orderIndex(1).isDeleted(false).build(),
                                        Flashcard.builder().flashcardSet(javaBasics).term("JRE")
                                                        .definition("Java Runtime Environment")
                                                        .orderIndex(2).isDeleted(false).build(),
                                        Flashcard.builder().flashcardSet(javaBasics).term("Polymorphism")
                                                        .definition("One name, many forms")
                                                        .orderIndex(3).isDeleted(false).build(),
                                        Flashcard.builder().flashcardSet(javaBasics).term("Inheritance")
                                                        .definition("Reusing code from parent classes").orderIndex(4)
                                                        .isDeleted(false).build()));

                        flashcardRepository.saveAll(List.of(
                                        Flashcard.builder().flashcardSet(calculusSum).term("d/dx (x^n)")
                                                        .definition("n * x^(n-1)")
                                                        .orderIndex(0).isDeleted(false).build(),
                                        Flashcard.builder().flashcardSet(calculusSum).term("d/dx (sin x)")
                                                        .definition("cos x").orderIndex(1)
                                                        .isDeleted(false).build(),
                                        Flashcard.builder().flashcardSet(calculusSum).term("d/dx (e^x)")
                                                        .definition("e^x").orderIndex(2)
                                                        .isDeleted(false).build()));

                        // --- Folders ---
                        Folder teacherFolder = Folder.builder()
                                        .owner(teacher)
                                        .name("Semester 1 Materials")
                                        .description("All sets for the first semester.")
                                        .visibility("PUBLIC")
                                        .isDeleted(false)
                                        .build();

                        folderRepository.save(teacherFolder);

                        // // --- User Statistics ---
                        // userStatisticRepository.save(UserStatistic.builder()
                        // .user(teacher)
                        // .totalSets(2L)
                        // .totalCards(8L)
                        // .quizzesTaken(0L)
                        // .lastActiveAt(LocalDateTime.now())
                        // .build());
                        //
                        // userStatisticRepository.save(UserStatistic.builder()
                        // .user(student1)
                        // .totalSets(1L)
                        // .totalCards(0L)
                        // .quizzesTaken(5L)
                        // .lastActiveAt(LocalDateTime.now().minusDays(1))
                        // .build());

                        // // --- Flashcard Set Statistic ---
                        // flashcardSetStatisticRepository.save(FlashcardSetStatistic.builder()
                        // .flashcardSet(javaBasics)
                        // .setId(javaBasics.getSetId())
                        // .viewCount(150L)
                        // .quizCount(40L)
                        // .retentionRate(new java.math.BigDecimal("85.5"))
                        // .lastViewedAt(LocalDateTime.now())
                        // .build());

                        // --- Audit Logs ---
                        auditLogRepository.save(AuditLog.builder()
                                        .user(admin)
                                        .action("USER_LOGIN")
                                        .entityType("USER")
                                        .entityId(0L) // Dummy entity ID
                                        .details("Admin logged in from 127.0.0.1")
                                        .build());

                        // --- Moderation History ---
                        moderationHistoryRepository.save(ModerationHistory.builder()
                                        .moderator(admin)
                                        .entityType("SET")
                                        .entityId(javaBasics.getSetId())
                                        .action("APPROVE")
                                        .notes("Content quality is high.")
                                        .build());

                        // --- OAuth Account ---
                        oAuthAccountRepository.save(OAuthAccount.builder()
                                        .user(student1)
                                        .provider("GOOGLE")
                                        .providerUserId("google-sub-12345")
                                        .build());

                        // --- Password Reset ---
                        passwordResetRepository.save(PasswordReset.builder()
                                        .user(student2)
                                        .resetToken(UUID.randomUUID().toString())
                                        .expiresAt(LocalDateTime.now().plusHours(24))
                                        .build());

                        // --- Study Progress ---
                        List<Flashcard> flashcards = flashcardRepository
                                        .findByFlashcardSetAndIsDeletedFalseOrderByOrderIndexAsc(javaBasics);
                        if (!flashcards.isEmpty()) {
                                studyProgressRepository.save(StudyProgress.builder()
                                                .user(student1)
                                                .flashcard(flashcards.get(0))
                                                .masteryLevel(3)
                                                .streak(5)
                                                .resetCount(0)
                                                .lastStudiedAt(LocalDateTime.now())
                                                .build());
                        }

                        // --- System Statistic ---
                        systemStatisticRepository.save(SystemStatistic.builder()
                                        .statKey("total_users")
                                        .statValue(4L)
                                        .build());
                        systemStatisticRepository.save(SystemStatistic.builder()
                                        .statKey("total_sets")
                                        .statValue(3L)
                                        .build());

                        // --- User Session ---
                        userSessionRepository.save(UserSession.builder()
                                        .user(teacher)
                                        .sessionToken(UUID.randomUUID().toString())
                                        .refreshToken(UUID.randomUUID().toString())
                                        .ipAddress("127.0.0.1")
                                        .userAgent("Mozilla/5.0")
                                        .build());

                        // --- Folder-Set Mappings ---
                        folderSetRepository.save(FolderSet.builder()
                                        .id(new FolderSet.FolderSetId(teacherFolder.getFolderId(),
                                                        javaBasics.getSetId()))
                                        .folder(teacherFolder)
                                        .flashcardSet(javaBasics)
                                        .addedAt(LocalDateTime.now())
                                        .addedBy(teacher.getUserId())
                                        .build());

                        folderSetRepository.save(FolderSet.builder()
                                        .id(new FolderSet.FolderSetId(teacherFolder.getFolderId(),
                                                        calculusSum.getSetId()))
                                        .folder(teacherFolder)
                                        .flashcardSet(calculusSum)
                                        .addedAt(LocalDateTime.now())
                                        .addedBy(teacher.getUserId())
                                        .build());

                        // --- Class Invites ---
                        classInviteRepository.save(ClassInvite.builder()
                                        .clazz(javaClass)
                                        .inviterId(teacher.getUserId())
                                        .email("newstudent@example.com")
                                        .token(UUID.randomUUID().toString())
                                        .status("PENDING")
                                        .expiresAt(LocalDateTime.now().plusDays(7))
                                        .build());

                        // --- Class Join Requests ---
                        classJoinRequestRepository.save(ClassJoinRequest.builder()
                                        .clazz(mathClass)
                                        .user(student2)
                                        .message("I would like to join the Advanced Math class.")
                                        .status("PENDING")
                                        .build());

                        // --- Class Materials ---
                        classMaterialRepository.save(ClassMaterial.builder()
                                        .clazz(javaClass)
                                        .materialType("SET")
                                        .materialRefId(javaBasics.getSetId())
                                        .addedBy(teacher.getUserId())
                                        .build());

                        System.out.println("Sample data initialized!");
                };
        }
}
