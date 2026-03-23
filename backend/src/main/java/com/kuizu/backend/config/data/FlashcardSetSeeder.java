package com.kuizu.backend.config.data;

import com.kuizu.backend.entity.Flashcard;
import com.kuizu.backend.entity.FlashcardSet;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.entity.enumeration.ModerationStatus;
import com.kuizu.backend.entity.enumeration.Visibility;
import com.kuizu.backend.repository.FlashcardRepository;
import com.kuizu.backend.repository.FlashcardSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class FlashcardSetSeeder {
    private final FlashcardSetRepository flashcardSetRepository;
    private final FlashcardRepository flashcardRepository;
    private final UserSeeder userSeeder;

    private final Map<String, FlashcardSet> setCache = new HashMap<>();

    public void seed() {
        if (flashcardSetRepository.count() > 0) {
            flashcardSetRepository.findAll().forEach(s -> setCache.put(s.getTitle(), s));
            return;
        }

        // --- JAVA BASICS ---
        FlashcardSet javaBasics = createSet("Java Collections Framework", "A guide for using lists, sets, and maps in Java.", "prof_john", Visibility.PUBLIC, ModerationStatus.APPROVED);
        addFlashcards(javaBasics, List.of(
                new CardInfo("ArrayList", "A resizable array implementation of the List interface."),
                new CardInfo("HashMap", "A collection that stores elements in key-value pairs."),
                new CardInfo("HashSet", "A collection that contains no duplicate elements."),
                new CardInfo("Iterable", "The root interface of the whole collection framework."),
                new CardInfo("Iterator", "An object that can be used to loop through collections.")
        ));

        // --- WEB DEV ---
        FlashcardSet reactHooks = createSet("React Hooks Overview", "Learn standard React hooks like useState and useEffect.", "prof_john", Visibility.PUBLIC, ModerationStatus.APPROVED);
        addFlashcards(reactHooks, List.of(
                new CardInfo("useState", "A hook that lets you add state to functional components."),
                new CardInfo("useEffect", "A hook that lets you perform side effects in functional components."),
                new CardInfo("useContext", "A hook that provides context to functional components."),
                new CardInfo("useRef", "A hook that creates a mutable ref object.")
        ));

        // --- CHEMISTRY ---
        FlashcardSet chemicalBonding = createSet("Introduction to Chemical Bonding", "Covers ionic, covalent, and metallic bonds.", "dr_sarah", Visibility.PUBLIC, ModerationStatus.APPROVED);
        addFlashcards(chemicalBonding, List.of(
                new CardInfo("Covalent Bond", "A chemical bond that involves the sharing of electron pairs."),
                new CardInfo("Ionic Bond", "Complete transfer of valence electrons between atoms."),
                new CardInfo("Metallic Bond", "Electrostatic attraction between metal cations and delocalized electrons."),
                new CardInfo("Electronegativity", "A measure of the tendency of an atom to attract a bonding pair of electrons.")
        ));

        // --- BIOLOGY ---
        FlashcardSet cellBiology = createSet("Cell Structure and Function", "The basics of eukaryotic and prokaryotic cells.", "dr_sarah", Visibility.PUBLIC, ModerationStatus.APPROVED);
        addFlashcards(cellBiology, List.of(
                new CardInfo("Mitochondria", "The powerhouses of the cell that generate most ATP."),
                new CardInfo("Nucleus", "An organelle that contains most of the genetic material."),
                new CardInfo("Ribosomes", "Molecular machines that synthesize proteins."),
                new CardInfo("Cytoplasm", "The material within a living cell, excluding the nucleus.")
        ));

        // --- HISTORY ---
        FlashcardSet worldWar1 = createSet("World War I Causes", "Key events leading to the Great War.", "mrs_davis", Visibility.PUBLIC, ModerationStatus.APPROVED);
        addFlashcards(worldWar1, List.of(
                new CardInfo("MAIN Causes", "Militarism, Alliances, Imperialism, Nationalism."),
                new CardInfo("Archduke Franz Ferdinand", "His assassination triggered the start of WWI."),
                new CardInfo("Triple Entente", "The alliance of Great Britain, France, and Russia."),
                new CardInfo("Triple Alliance", "The alliance of Germany, Austria-Hungary, and Italy.")
        ));

        // --- STUDENT SETS ---
        FlashcardSet englishPhrases = createSet("Essential English Phrases", "Everyday phrases for non-native speakers.", "alice_j", Visibility.PUBLIC, ModerationStatus.APPROVED);
        addFlashcards(englishPhrases, List.of(
                new CardInfo("Break a leg", "A way to say good luck to someone."),
                new CardInfo("Better late than never", "Better to arrive late than not to come at all."),
                new CardInfo("Piece of cake", "Something that is very easy to do.")
        ));

        // --- NEW DATA: PHYSICS ---
        FlashcardSet physicsBasics = createSet("Classical Mechanics", "Newton's laws and basic kinematics.", "dr_sarah", Visibility.PUBLIC, ModerationStatus.APPROVED);
        addFlashcards(physicsBasics, List.of(
                new CardInfo("Newton's First Law", "An object at rest stays at rest unless acted upon by a force."),
                new CardInfo("Momentum", "The product of the mass and velocity of an object."),
                new CardInfo("Kinetic Energy", "The energy an object possesses due to its motion.")
        ));

        // --- NEW DATA: PENDING SUBMISSIONS ---
        createSet("Deep Learning Fundamentals", "Introduction to neural networks and backpropagation.", "prof_john", Visibility.PUBLIC, ModerationStatus.PENDING);
        createSet("French Basic Phrases", "Essential vocabulary for traveling to France.", "alice_j", Visibility.PUBLIC, ModerationStatus.PENDING);
        createSet("Advanced SQL Techniques", "Window functions, CTEs, and query optimization.", "prof_john", Visibility.PUBLIC, ModerationStatus.PENDING);
        createSet("Renaissance Art History", "A survey of Italian and Northern Renaissance artists.", "mrs_davis", Visibility.PUBLIC, ModerationStatus.PENDING);
        createSet("Introduction to Sociology Concepts", "Key terms in social science.", "mrs_lee", Visibility.PUBLIC, ModerationStatus.PENDING);
        createSet("Cellular Processes", "Review for the molecular biology exam.", "dr_sarah", Visibility.PUBLIC, ModerationStatus.PENDING);
        createSet("Introduction to Macroeconomics", "GDP, inflation, and unemployment explained.", "prof_brown", Visibility.PUBLIC, ModerationStatus.PENDING);
        createSet("Fundamentals of Philosophy", "Plato to Kant: exploring the big questions.", "mrs_davis", Visibility.PUBLIC, ModerationStatus.PENDING);
        createSet("The Periodic Table", "Flashcards for all chemical elements.", "dr_sarah", Visibility.PUBLIC, ModerationStatus.PENDING);
        createSet("French Verb Conjugation", "Advanced French grammar practice.", "alice_j", Visibility.PUBLIC, ModerationStatus.PENDING);
        createSet("Data Structures - Graphs", "Nodes, edges, and pathfinding algorithms.", "prof_john", Visibility.PUBLIC, ModerationStatus.PENDING);
        createSet("Organic Chemistry Reactions", "Named reactions and mechanisms.", "dr_sarah", Visibility.PUBLIC, ModerationStatus.PENDING);
        createSet("Calculus III Review", "Multivariable calculus foundations.", "prof_brown", Visibility.PUBLIC, ModerationStatus.PENDING);
        createSet("Marketing Strategy", "SWOT analysis and market positioning.", "prof_brown", Visibility.PUBLIC, ModerationStatus.PENDING);
        createSet("Music History - Baroque", "Exploring the masters like Bach and Vivaldi.", "mrs_lee", Visibility.PUBLIC, ModerationStatus.PENDING);

        // --- NEW APPROVED DATA ---
        FlashcardSet psychBasics = createSet("Basic Psychology", "The human mind and behavior.", "dr_sarah", Visibility.PUBLIC, ModerationStatus.APPROVED);
        addFlashcards(psychBasics, List.of(
            new CardInfo("Classical Conditioning", "Learning process that occurs through associations."),
            new CardInfo("Cognitive Dissonance", "The mental discomfort of holding contradictory beliefs.")
        ));

        FlashcardSet musicSymbols = createSet("Common Music Symbols", "Reading the musical staff.", "mrs_lee", Visibility.PUBLIC, ModerationStatus.APPROVED);
        addFlashcards(musicSymbols, List.of(
            new CardInfo("Treble Clef", "The G-clef used for higher pitches."),
            new CardInfo("Forte", "A musical dynamic meaning to play loudly.")
        ));
    }

    private FlashcardSet createSet(String title, String description, String ownerUsername, Visibility visibility, ModerationStatus status) {
        User owner = userSeeder.getUser(ownerUsername);
        FlashcardSet set = FlashcardSet.builder()
                .owner(owner)
                .title(title)
                .description(description)
                .visibility(visibility)
                .status(status)
                .isDeleted(false)
                .version(1)
                .createdAt(LocalDateTime.now().minusDays(30))
                .submittedAt(status == ModerationStatus.PENDING ? LocalDateTime.now().minusDays(2) : null)
                .submittedBy(status == ModerationStatus.PENDING ? owner.getUserId() : null)
                .build();
        set = flashcardSetRepository.save(set);
        setCache.put(title, set);
        return set;
    }

    private void addFlashcards(FlashcardSet set, List<CardInfo> cardInfos) {
        int index = 0;
        for (CardInfo info : cardInfos) {
            flashcardRepository.save(Flashcard.builder()
                    .flashcardSet(set)
                    .term(info.term)
                    .definition(info.definition)
                    .orderIndex(index++)
                    .isDeleted(false)
                    .build());
        }
    }

    private record CardInfo(String term, String definition) {}

    public FlashcardSet getSet(String title) {
        return setCache.get(title);
    }
}
