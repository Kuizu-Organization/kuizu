package com.kuizu.backend.config;

import com.kuizu.backend.config.data.*;
import com.kuizu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserSeeder userSeeder;
    private final ClassSeeder classSeeder;
    private final FlashcardSetSeeder flashcardSetSeeder;
    private final MiscDataSeeder miscDataSeeder;

    @Bean
    @org.springframework.core.annotation.Order(1)
    @Profile("!test")
    public CommandLineRunner initData() {
        return args -> {
            try {
                log.info("Starting comprehensive data initialization...");

                // 1. Users first (Required by others)
                userSeeder.seed();

                // 2. Classes and Flashcard Sets
                classSeeder.seed();
                flashcardSetSeeder.seed();

                // 3. Other related data (Statistics, Folders, Audit Logs)
                miscDataSeeder.seed();

                log.info("Comprehensive data initialization completed successfully!");
            } catch (Exception e) {
                log.error("Fatal error during data initialization!", e);
            }
        };
    }
}
