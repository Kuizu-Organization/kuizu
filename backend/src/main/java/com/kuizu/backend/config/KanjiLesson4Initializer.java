package com.kuizu.backend.config;

import com.kuizu.backend.entity.Flashcard;
import com.kuizu.backend.entity.FlashcardSet;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.repository.FlashcardRepository;
import com.kuizu.backend.repository.FlashcardSetRepository;
import com.kuizu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.ArrayList;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class KanjiLesson4Initializer {

    private final UserRepository userRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final FlashcardRepository flashcardRepository;

    @Bean
    @org.springframework.core.annotation.Order(3)
    @Profile("!test")
    public CommandLineRunner initKanjiLesson4() {
        return args -> {
            if (flashcardSetRepository.findByTitle("Kanji bài 4").isPresent()) {
                return;
            }

            User owner = userRepository.findByUsername("student1").orElse(null);
            if (owner == null) return;

            FlashcardSet kanjiSet = FlashcardSet.builder()
                    .owner(owner)
                    .title("Kanji bài 4")
                    .description("Bộ từ vựng Kanji bài 4.")
                    .visibility(com.kuizu.backend.entity.enumeration.Visibility.PUBLIC)
                    .status(com.kuizu.backend.entity.enumeration.ModerationStatus.ACTIVE)
                    .isDeleted(false)
                    .version(1)
                    .build();
            
            kanjiSet = flashcardSetRepository.save(kanjiSet);

            List<Flashcard> flashcards = new ArrayList<>();
            
            flashcards.add(Flashcard.builder().flashcardSet(kanjiSet).term("東 (ひがし)").definition("Phía đông").orderIndex(0).isDeleted(false).build());
            flashcards.add(Flashcard.builder().flashcardSet(kanjiSet).term("東京 (とうきょう)").definition("Tokyo").orderIndex(1).isDeleted(false).build());
            flashcards.add(Flashcard.builder().flashcardSet(kanjiSet).term("名前 (なまえ)").definition("Tên").orderIndex(2).isDeleted(false).build());
            flashcards.add(Flashcard.builder().flashcardSet(kanjiSet).term("前 (まえ)").definition("Phía trước").orderIndex(3).isDeleted(false).build());
            flashcards.add(Flashcard.builder().flashcardSet(kanjiSet).term("前日 (ぜんじつ)").definition("Ngày trước (đó)").orderIndex(4).isDeleted(false).build());
            flashcards.add(Flashcard.builder().flashcardSet(kanjiSet).term("国 (くに)").definition("Nước, quốc gia").orderIndex(5).isDeleted(false).build());
            flashcards.add(Flashcard.builder().flashcardSet(kanjiSet).term("国語 (こくご)").definition("Quốc ngữ").orderIndex(6).isDeleted(false).build());
            flashcards.add(Flashcard.builder().flashcardSet(kanjiSet).term("男の人 (おとこのひと)").definition("Người đàn ông, nam").orderIndex(7).isDeleted(false).build());
            flashcards.add(Flashcard.builder().flashcardSet(kanjiSet).term("女の人 (おんなのひと)").definition("Người phụ nữ, nữ").orderIndex(8).isDeleted(false).build());
            flashcards.add(Flashcard.builder().flashcardSet(kanjiSet).term("男女 (だんじょ)").definition("Nam nữ").orderIndex(9).isDeleted(false).build());
            flashcards.add(Flashcard.builder().flashcardSet(kanjiSet).term("区 (く)").definition("Quận").orderIndex(10).isDeleted(false).build());
            flashcards.add(Flashcard.builder().flashcardSet(kanjiSet).term("市 (し)").definition("Thành phố").orderIndex(11).isDeleted(false).build());

            flashcardRepository.saveAll(flashcards);
            System.out.println("=================================================");
            System.out.println("SUCCESS: Kanji Lesson 4 flashcards initialized!");
            System.out.println("Set Title: " + kanjiSet.getTitle());
            System.out.println("Owner: " + owner.getUsername());
            System.out.println("=================================================");
        };
    }
}
