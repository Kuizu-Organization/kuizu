package com.kuizu.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class DbTest {

    @Bean
    CommandLineRunner testConnection(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                log.info("Testing database connection...");
                String result = jdbcTemplate.queryForObject("SELECT @@VERSION", String.class);
                log.info("Successfully connected to SQL Server!");
                log.info("Database Version: {}", result);
            } catch (Exception e) {
                log.error("Failed to connect to database: {}", e.getMessage());
            }
        };
    }
}
