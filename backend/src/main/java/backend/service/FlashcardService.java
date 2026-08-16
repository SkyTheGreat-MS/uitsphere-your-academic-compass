package backend.service;

import backend.dto.FlashcardDeckDetailResponse;
import backend.dto.FlashcardDeckResponse;
import backend.dto.FlashcardGenerateRequest;
import backend.dto.FlashcardProgressResponse;
import backend.dto.FlashcardResponse;
import backend.entity.Flashcard;
import backend.entity.FlashcardDeck;
import backend.entity.FlashcardProgress;
import backend.entity.Student;
import backend.repository.FlashcardDeckRepository;
import backend.repository.FlashcardProgressRepository;
import backend.repository.FlashcardRepository;
import backend.repository.StudentRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FlashcardService {

    private final FlashcardDeckRepository deckRepository;
    private final FlashcardRepository flashcardRepository;
    private final FlashcardProgressRepository progressRepository;
    private final StudentRepository studentRepository;
    private final AIContentGenerationService generationService;
    private final FlashcardResponseParser responseParser;
    private final StudyStreakService studyStreakService;
    private final NotificationService notificationService;

    public FlashcardService(
            FlashcardDeckRepository deckRepository,
            FlashcardRepository flashcardRepository,
            FlashcardProgressRepository progressRepository,
            StudentRepository studentRepository,
            AIContentGenerationService generationService,
            FlashcardResponseParser responseParser, StudyStreakService studyStreakService,
            NotificationService notificationService) {
        this.deckRepository = deckRepository;
        this.flashcardRepository = flashcardRepository;
        this.progressRepository = progressRepository;
        this.studentRepository = studentRepository;
        this.generationService = generationService;
        this.responseParser = responseParser;
        this.studyStreakService = studyStreakService;
        this.notificationService = notificationService;
    }

    @Transactional
    public FlashcardDeckDetailResponse generate(FlashcardGenerateRequest request) {
        Student student = currentStudent();
        List<Long> materialIds = request.materialIds().stream().distinct().toList();

        String rawContent = generationService.generateFlashcards(materialIds);
        List<FlashcardResponseParser.ParsedFlashcard> parsed = responseParser.parse(rawContent);

        FlashcardDeck deck = new FlashcardDeck();
        deck.setStudent(student);
        deck.setTitle(materialIds.size() == 1 ? "Lecture flashcards" : "Combined lecture flashcards");
        deck.setMaterialIds(materialIds);
        deck = deckRepository.save(deck);

        int orderIndex = 0;
        List<FlashcardResponse> cardResponses = new ArrayList<>();
        for (FlashcardResponseParser.ParsedFlashcard parsedCard : parsed) {
            Flashcard card = new Flashcard();
            card.setDeck(deck);
            card.setQuestion(parsedCard.question());
            card.setAnswer(parsedCard.answer());
            card.setDifficulty(parsedCard.difficulty());
            card.setOrderIndex(orderIndex++);
            flashcardRepository.save(card);
            cardResponses.add(FlashcardResponse.from(card, false));
        }

        notificationService.notify(
                student,
                "flashcards",
                "Flashcards generated",
                "\"" + deck.getTitle() + "\" is ready to review.",
                "/studio");

        return FlashcardDeckDetailResponse.from(deck, cardResponses, 0);
    }

    public List<FlashcardDeckResponse> list() {
        return deckRepository.findByStudentOrderByUpdatedAtDesc(currentStudent())
                .stream()
                .map(deck -> FlashcardDeckResponse.from(deck, flashcardRepository.countByDeckId(deck.getId())))
                .toList();
    }

    @Transactional
    public FlashcardDeckDetailResponse getDeck(Long deckId) {
        Student student = currentStudent();
        FlashcardDeck deck = deckRepository.findByIdAndStudent(deckId, student)
                .orElseThrow(() -> new LearningMaterialException("Flashcard deck not found."));

        List<Flashcard> cards = flashcardRepository.findByDeckIdOrderByOrderIndexAsc(deckId);
        Set<Long> learnedIds = progressRepository.findAllByStudentAndFlashcardIn(student, cards)
                .stream()
                .filter(FlashcardProgress::isLearned)
                .map(progress -> progress.getFlashcard().getId())
                .collect(Collectors.toSet());

        List<FlashcardResponse> cardResponses = cards.stream()
                .map(card -> FlashcardResponse.from(card, learnedIds.contains(card.getId())))
                .toList();
        long learnedCount = cardResponses.stream().filter(FlashcardResponse::learned).count();

        return FlashcardDeckDetailResponse.from(deck, cardResponses, learnedCount);
    }

    @Transactional
    public void deleteDeck(Long deckId) {
        FlashcardDeck deck = deckRepository.findByIdAndStudent(deckId, currentStudent())
                .orElseThrow(() -> new LearningMaterialException("Flashcard deck not found."));
        deckRepository.delete(deck);
    }

    @Transactional
    public FlashcardProgressResponse markLearned(Long flashcardId, boolean learned) {
        Student student = currentStudent();
        Flashcard flashcard = flashcardRepository.findById(flashcardId)
                .orElseThrow(() -> new LearningMaterialException("Flashcard not found."));
        if (flashcard.getDeck().getStudent().getId() != student.getId()) {
            throw new LearningMaterialException("Flashcard not found.");
        }

        FlashcardProgress progress = progressRepository.findByStudentAndFlashcard(student, flashcard)
                .orElseGet(() -> {
                    FlashcardProgress created = new FlashcardProgress();
                    created.setStudent(student);
                    created.setFlashcard(flashcard);
                    return created;
                });
        progress.setLearned(learned);
        if (learned) {
            progress.setLastReviewed(LocalDateTime.now());
        }
        FlashcardProgress saved = progressRepository.save(progress);
        if (learned) studyStreakService.record(student, backend.entity.StudyActivityType.FLASHCARD_REVIEW);
        return FlashcardProgressResponse.from(saved);
    }

    private Student currentStudent() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new LearningMaterialException("Authenticated student not found."));
    }
}
