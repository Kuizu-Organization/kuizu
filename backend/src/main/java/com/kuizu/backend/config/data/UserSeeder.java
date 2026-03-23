package com.kuizu.backend.config.data;

import com.kuizu.backend.entity.User;
import com.kuizu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class UserSeeder {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final Map<String, User> userCache = new ConcurrentHashMap<>();

    public void seed() {
        if (userRepository.count() > 0) {
            userRepository.findAll().forEach(u -> userCache.put(u.getUsername(), u));
            return;
        }

        String commonPassword = passwordEncoder.encode("password123");

        // Admin
        createUser("admin", "admin@kuizu.com", commonPassword, "System Administrator", User.UserRole.ROLE_ADMIN);

        // Teachers
        createUser("prof_john", "john.smith@university.edu", commonPassword, "Professor John Smith", User.UserRole.ROLE_TEACHER);
        createUser("dr_sarah", "s.williams@college.edu", commonPassword, "Dr. Sarah Williams", User.UserRole.ROLE_TEACHER);
        createUser("mrs_davis", "davis.m@highschool.org", commonPassword, "Mrs. Maria Davis", User.UserRole.ROLE_TEACHER);
        createUser("prof_brown", "robert.brown@univeristy.net", commonPassword, "Professor Robert Brown", User.UserRole.ROLE_TEACHER);
        createUser("mrs_lee", "lee.a@middle.edu", commonPassword, "Mrs. Angela Lee", User.UserRole.ROLE_TEACHER);

        // Students
        createUser("alice_j", "alice.j@student.edu", commonPassword, "Alice Johnson", User.UserRole.ROLE_STUDENT);
        createUser("bob_w", "bob.wilson@student.edu", commonPassword, "Bob Wilson", User.UserRole.ROLE_STUDENT);
        createUser("charlie_b", "charlie.brown@student.edu", commonPassword, "Charlie Brown", User.UserRole.ROLE_STUDENT);
        createUser("david_m", "david.m@student.edu", commonPassword, "David Miller", User.UserRole.ROLE_STUDENT);
        createUser("eva_g", "eva.g@student.edu", commonPassword, "Eva Garcia", User.UserRole.ROLE_STUDENT);
        createUser("frank_h", "frank.h@student.edu", commonPassword, "Frank Harris", User.UserRole.ROLE_STUDENT);
        createUser("grace_l", "grace.l@student.edu", commonPassword, "Grace Lee", User.UserRole.ROLE_STUDENT);
        createUser("henry_k", "henry.k@student.edu", commonPassword, "Henry King", User.UserRole.ROLE_STUDENT);
        createUser("isabel_c", "isabel.c@student.edu", commonPassword, "Isabel Clark", User.UserRole.ROLE_STUDENT);
        createUser("jack_r", "jack.r@student.edu", commonPassword, "Jack Robinson", User.UserRole.ROLE_STUDENT);
        createUser("karen_w", "karen.w@student.edu", commonPassword, "Karen White", User.UserRole.ROLE_STUDENT);
        createUser("leo_t", "leo.t@student.edu", commonPassword, "Leo Taylor", User.UserRole.ROLE_STUDENT);
        createUser("mia_h", "mia.h@student.edu", commonPassword, "Mia Hall", User.UserRole.ROLE_STUDENT);
        createUser("noah_a", "noah.a@student.edu", commonPassword, "Noah Adams", User.UserRole.ROLE_STUDENT);
        createUser("olivia_b", "olivia.b@student.edu", commonPassword, "Olivia Baker", User.UserRole.ROLE_STUDENT);
        createUser("paul_s", "paul.s@student.edu", commonPassword, "Paul Scott", User.UserRole.ROLE_STUDENT);
        createUser("quinn_f", "quinn.f@student.edu", commonPassword, "Quinn Fisher", User.UserRole.ROLE_STUDENT);
        createUser("rebecca_p", "rebecca.p@student.edu", commonPassword, "Rebecca Price", User.UserRole.ROLE_STUDENT);
    }

    private void createUser(String username, String email, String password, String displayName, User.UserRole role) {
        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(password)
                .displayName(displayName)
                .role(role)
                .status(User.UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now().minusDays(30))
                .build();
        user = userRepository.save(user);
        userCache.put(username, user);
    }

    public User getUser(String username) {
        return userCache.get(username);
    }

    public List<User> getStudents() {
        return userCache.values().stream()
                .filter(u -> u.getRole() == User.UserRole.ROLE_STUDENT)
                .toList();
    }
}
