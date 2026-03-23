package com.kuizu.backend.config.data;

import com.kuizu.backend.entity.ClassJoinRequest;
import com.kuizu.backend.entity.ClassMember;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.entity.enumeration.ModerationStatus;
import com.kuizu.backend.entity.enumeration.Visibility;
import com.kuizu.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ClassSeeder {
    private final ClassRepository classRepository;
    private final ClassMemberRepository classMemberRepository;
    private final ClassJoinRequestRepository classJoinRequestRepository;
    private final ClassInviteRepository classInviteRepository;
    private final ClassMaterialRepository classMaterialRepository;
    private final UserSeeder userSeeder;
    private final FlashcardSetSeeder flashcardSetSeeder;

    private final Map<String, com.kuizu.backend.entity.Class> classCache = new HashMap<>();

    public void seed() {
        if (classRepository.count() > 0) {
            classRepository.findAll().forEach(c -> classCache.put(c.getClassName(), c));
            return;
        }

        // --- Active Classes ---
        createClass("Introduction to Algorithms", "A fundamental course for computer science students.", "prof_john", Visibility.PUBLIC, ModerationStatus.ACTIVE);
        createClass("Modern Web Development", "Explore frontend and backend technologies.", "prof_john", Visibility.PUBLIC, ModerationStatus.ACTIVE);
        createClass("Organic Chemistry 101", "Basics of organic chemical reactions.", "dr_sarah", Visibility.PUBLIC, ModerationStatus.ACTIVE);
        createClass("Advanced Mathematics", "Calculus and Linear Algebra for engineers.", "dr_sarah", Visibility.PRIVATE, ModerationStatus.ACTIVE);
        createClass("World History", "A journey through historical events from 1500 to present.", "mrs_davis", Visibility.PUBLIC, ModerationStatus.ACTIVE);
        createClass("AI and Ethics", "Discussing the moral implications of artificial intelligence.", "prof_john", Visibility.PUBLIC, ModerationStatus.ACTIVE);
        createClass("Digital Marketing 101", "Basics of SEO, SEM, and social media marketing.", "prof_brown", Visibility.PUBLIC, ModerationStatus.ACTIVE);
        createClass("Music Theory", "Understanding the language of music.", "mrs_lee", Visibility.PUBLIC, ModerationStatus.ACTIVE);
        createClass("Environmental Science", "Study of the environment and solutions to environmental problems.", "dr_sarah", Visibility.PUBLIC, ModerationStatus.ACTIVE);
        createClass("Microeconomics", "The study of individuals and business decisions.", "prof_brown", Visibility.PUBLIC, ModerationStatus.ACTIVE);

        // --- Pending Classes ---
        createClass("English Literature", "Exploring the classics from Shakespeare to Dickens.", "mrs_davis", Visibility.PUBLIC, ModerationStatus.PENDING);
        createClass("Data Science with Python", "Analyze data using modern libraries like pandas and scikit-learn.", "prof_john", Visibility.PUBLIC, ModerationStatus.PENDING);
        createClass("Introduction to Psychology", "Basic concepts of human behavior.", "dr_sarah", Visibility.PUBLIC, ModerationStatus.PENDING);
        createClass("20th Century Art History", "A survey of modern movements in art.", "mrs_davis", Visibility.PUBLIC, ModerationStatus.PENDING);
        createClass("Principles of Economics", "Micro and macro economics overview.", "prof_john", Visibility.PUBLIC, ModerationStatus.PENDING);
        createClass("Advanced Java Performance", "Optimizing memory and execution in Java apps.", "prof_john", Visibility.PUBLIC, ModerationStatus.PENDING);
        createClass("Cellular Biology", "The building blocks of life at a molecular level.", "dr_sarah", Visibility.PUBLIC, ModerationStatus.PENDING);
        createClass("Machine Learning in Practice", "Applying ML models to real-world datasets.", "prof_john", Visibility.PUBLIC, ModerationStatus.PENDING);
        createClass("Macroeconomics", "The behavior of a whole economy.", "prof_brown", Visibility.PUBLIC, ModerationStatus.PENDING);
        createClass("Introduction to Sociology", "Study of human social relationships and institutions.", "mrs_lee", Visibility.PUBLIC, ModerationStatus.PENDING);
        createClass("Physics for Engineers", "Core physics concepts for engineering students.", "dr_sarah", Visibility.PUBLIC, ModerationStatus.PENDING);

        // --- Class Members ---
        addMemberToClass("Introduction to Algorithms", "alice_j");
        addMemberToClass("Introduction to Algorithms", "bob_w");
        addMemberToClass("Introduction to Algorithms", "charlie_b");
        addMemberToClass("Modern Web Development", "alice_j");
        addMemberToClass("Modern Web Development", "david_m");
        addMemberToClass("Organic Chemistry 101", "eva_g");
        addMemberToClass("Organic Chemistry 101", "frank_h");
        addMemberToClass("Organic Chemistry 101", "grace_l");
        addMemberToClass("World History", "henry_k");
        addMemberToClass("World History", "charlie_b");
        addMemberToClass("AI and Ethics", "isabel_c");
        addMemberToClass("AI and Ethics", "jack_r");
        addMemberToClass("Digital Marketing 101", "karen_w");
        addMemberToClass("Digital Marketing 101", "leo_t");
        addMemberToClass("Music Theory", "mia_h");
        addMemberToClass("Music Theory", "noah_a");
        addMemberToClass("Environmental Science", "olivia_b");
        addMemberToClass("Environmental Science", "paul_s");
        addMemberToClass("Microeconomics", "quinn_f");
        addMemberToClass("Microeconomics", "rebecca_p");

        // --- Class Join Requests ---
        createJoinRequest("Advanced Mathematics", "alice_j", "I'd like to improve my calculus skills.");
        createJoinRequest("Advanced Mathematics", "bob_w", "Calculus is hard, help me!");
        createJoinRequest("Organic Chemistry 101", "david_m", "Can I join this class?");
        createJoinRequest("AI and Ethics", "mia_h", "I'm interested in AI morality.");
        createJoinRequest("Digital Marketing 101", "paul_s", "Marketing is for me.");
        createJoinRequest("Music Theory", "olivia_b", "I play the piano and want to learn theory.");

        // --- Class Invites ---
        createInvite("Introduction to Algorithms", "prof_john", "invited_student@example.com");

        // --- Class Materials ---
        addMaterialToClass("Introduction to Algorithms", "Java Collections Framework");
        addMaterialToClass("Modern Web Development", "React Hooks Overview");
        addMaterialToClass("Organic Chemistry 101", "Introduction to Chemical Bonding");
    }

    private void createClass(String className, String description, String ownerUsername, Visibility visibility, ModerationStatus status) {
        User owner = userSeeder.getUser(ownerUsername);
        com.kuizu.backend.entity.Class clazz = com.kuizu.backend.entity.Class.builder()
                .owner(owner)
                .className(className)
                .description(description)
                .visibility(visibility)
                .status(status)
                .joinCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .createdAt(LocalDateTime.now().minusDays(15))
                .submittedAt(status == ModerationStatus.PENDING ? LocalDateTime.now().minusDays(2) : null)
                .submittedBy(status == ModerationStatus.PENDING ? owner.getUserId() : null)
                .build();
        clazz = classRepository.save(clazz);
        classCache.put(className, clazz);
    }

    private void addMemberToClass(String className, String username) {
        com.kuizu.backend.entity.Class clazz = classCache.get(className);
        User user = userSeeder.getUser(username);
        if (clazz != null && user != null) {
            classMemberRepository.save(ClassMember.builder()
                    .id(new ClassMember.ClassMemberId(clazz.getClassId(), user.getUserId()))
                    .clazz(clazz)
                    .user(user)
                    .role("MEMBER")
                    .joinedAt(LocalDateTime.now().minusDays(10))
                    .build());
        }
    }

    private void createJoinRequest(String className, String username, String message) {
        com.kuizu.backend.entity.Class clazz = classCache.get(className);
        User user = userSeeder.getUser(username);
        if (clazz != null && user != null) {
            classJoinRequestRepository.save(ClassJoinRequest.builder()
                    .clazz(clazz)
                    .user(user)
                    .message(message)
                    .status("PENDING")
                    .requestedAt(LocalDateTime.now().minusDays(1))
                    .build());
        }
    }

    private void createInvite(String className, String inviterUsername, String email) {
        com.kuizu.backend.entity.Class clazz = classCache.get(className);
        User inviter = userSeeder.getUser(inviterUsername);
        if (clazz != null && inviter != null) {
            classInviteRepository.save(com.kuizu.backend.entity.ClassInvite.builder()
                    .clazz(clazz)
                    .inviterId(inviter.getUserId())
                    .email(email)
                    .token(UUID.randomUUID().toString())
                    .status("PENDING")
                    .expiresAt(LocalDateTime.now().plusDays(7))
                    .build());
        }
    }

    private void addMaterialToClass(String className, String setTitle) {
        com.kuizu.backend.entity.Class clazz = classCache.get(className);
        com.kuizu.backend.entity.FlashcardSet set = flashcardSetSeeder.getSet(setTitle);
        if (clazz != null && set != null) {
            classMaterialRepository.save(com.kuizu.backend.entity.ClassMaterial.builder()
                    .clazz(clazz)
                    .materialType("SET")
                    .materialRefId(set.getSetId())
                    .addedBy(clazz.getOwner().getUserId())
                    .addedAt(LocalDateTime.now().minusDays(5))
                    .build());
        }
    }

    public com.kuizu.backend.entity.Class getClass(String name) {
        return classCache.get(name);
    }
}
