package com.kuizu.backend.service;

import com.kuizu.backend.entity.Class;
import com.kuizu.backend.entity.FlashcardSet;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.entity.UserStatistic;
import com.kuizu.backend.entity.FlashcardSetStatistic;
import com.kuizu.backend.entity.enumeration.ModerationStatus;
import com.kuizu.backend.entity.enumeration.Visibility;
import com.kuizu.backend.repository.ClassRepository;
import com.kuizu.backend.repository.FlashcardSetRepository;
import com.kuizu.backend.repository.UserRepository;
import com.kuizu.backend.repository.UserStatisticRepository;
import com.kuizu.backend.repository.FlashcardSetStatisticRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MockDataSeederService {

    private final UserRepository userRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final ClassRepository classRepository;
    private final UserStatisticRepository userStatisticRepository;
    private final FlashcardSetStatisticRepository flashcardSetStatisticRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void seedMockData() {
        Random rnd = new Random();

        // Generate 50 Users
        List<User> users = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            User user = User.builder()
                    .username("mockUser" + i)
                    .email("mockuser" + i + (i % 3 == 0 ? "@gmail.com" : "@domain.com"))
                    .passwordHash(passwordEncoder.encode("password"))
                    .displayName("Mock User " + i)
                    .role(i % 10 == 0 ? User.UserRole.ROLE_TEACHER : User.UserRole.ROLE_STUDENT)
                    .status(User.UserStatus.ACTIVE)
                    .createdAt(LocalDateTime.now().minusDays(rnd.nextInt(60)))
                    .build();
            user = userRepository.save(user);
            users.add(user);

            // Add user statistic
            UserStatistic stat = UserStatistic.builder()
                    .user(user)
                    .userId(user.getUserId())
                    .totalSets((long) rnd.nextInt(10))
                    .totalCards((long) rnd.nextInt(100))
                    .quizzesTaken((long) rnd.nextInt(20))
                    .avgScore(java.math.BigDecimal.valueOf(rnd.nextInt(100)))
                    .lastActiveAt(LocalDateTime.now().minusDays(rnd.nextInt(10)))
                    .build();
            userStatisticRepository.save(stat);
        }

        // Generate Flashcard Sets
        List<FlashcardSet> sets = new ArrayList<>();
        for (int i = 1; i <= 30; i++) {
            User owner = users.get(rnd.nextInt(users.size()));
            FlashcardSet set = FlashcardSet.builder()
                    .owner(owner)
                    .title("Mock Flashcard Set " + i)
                    .description("This is a mock flashcard set for testing purposes.")
                    .visibility(Visibility.PUBLIC)
                    .isDeleted(false)
                    .status(ModerationStatus.APPROVED)
                    .build();
            set = flashcardSetRepository.save(set);
            sets.add(set);

            // Add flashcard stat
            FlashcardSetStatistic stat = FlashcardSetStatistic.builder()
                    .flashcardSet(set)
                    .setId(set.getSetId())
                    .viewCount((long) rnd.nextInt(500))
                    .quizCount((long) rnd.nextInt(100))
                    .retentionRate(java.math.BigDecimal.valueOf(rnd.nextInt(100)))
                    .lastViewedAt(LocalDateTime.now().minusDays(rnd.nextInt(5)))
                    .build();
            flashcardSetStatisticRepository.save(stat);
        }

        // Generate Classes
        for (int i = 1; i <= 10; i++) {
            User owner = users.get(rnd.nextInt(users.size()));
            Class clazz = Class.builder()
                    .owner(owner)
                    .className("Mock Class " + i)
                    .description("This is a mock class for testing purposes.")
                    .joinCode(UUID.randomUUID().toString().substring(0, 8))
                    .visibility(Visibility.PUBLIC)
                    .status(ModerationStatus.APPROVED)
                    .build();
            classRepository.save(clazz);
        }
    }
}
