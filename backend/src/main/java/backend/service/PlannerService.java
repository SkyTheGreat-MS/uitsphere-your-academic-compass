package backend.service;

import backend.dto.PlannerClassResponse;
import backend.dto.PlannerFlashcardResponse;
import backend.dto.PlannerMaterialResponse;
import backend.dto.PlannerQuizResponse;
import backend.dto.PlannerResourceResponse;
import backend.dto.PlannerResponse;
import backend.dto.RecommendationResponse;
import backend.dto.StudyTaskResponse;
import backend.entity.Flashcard;
import backend.entity.FlashcardDeck;
import backend.entity.FlashcardProgress;
import backend.entity.LearningMaterial;
import backend.entity.LearningMaterialStatus;
import backend.entity.Quiz;
import backend.entity.QuizAttempt;
import backend.entity.SmartNote;
import backend.entity.Student;
import backend.entity.StudyTask;
import backend.entity.StudyTaskPriority;
import backend.entity.Subject;
import backend.entity.Summary;
import backend.entity.TimetableEntry;
import backend.repository.FlashcardDeckRepository;
import backend.repository.FlashcardProgressRepository;
import backend.repository.FlashcardRepository;
import backend.repository.LearningMaterialRepository;
import backend.repository.QuizAttemptRepository;
import backend.repository.QuizRepository;
import backend.repository.SmartNoteRepository;
import backend.repository.StudentRepository;
import backend.repository.StudyTaskRepository;
import backend.repository.SubjectRepository;
import backend.repository.SummaryRepository;
import backend.repository.TimetableEntryRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PlannerService {

    private static final String ACADEMIC_YEAR = "2025-2026";
    private static final String SEMESTER = "Semester IV";
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private static final List<String> DAYS = List.of("Monday", "Tuesday", "Wednesday", "Thursday", "Friday");

    private final StudentRepository studentRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final LearningMaterialRepository learningMaterialRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final FlashcardDeckRepository flashcardDeckRepository;
    private final FlashcardRepository flashcardRepository;
    private final FlashcardProgressRepository flashcardProgressRepository;
    private final SummaryRepository summaryRepository;
    private final SmartNoteRepository smartNoteRepository;
    private final StudyTaskRepository studyTaskRepository;
    private final SubjectRepository subjectRepository;

    public PlannerService(
            StudentRepository studentRepository,
            TimetableEntryRepository timetableEntryRepository,
            LearningMaterialRepository learningMaterialRepository,
            QuizRepository quizRepository,
            QuizAttemptRepository quizAttemptRepository,
            FlashcardDeckRepository flashcardDeckRepository,
            FlashcardRepository flashcardRepository,
            FlashcardProgressRepository flashcardProgressRepository,
            SummaryRepository summaryRepository,
            SmartNoteRepository smartNoteRepository,
            StudyTaskRepository studyTaskRepository,
            SubjectRepository subjectRepository) {
        this.studentRepository = studentRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.learningMaterialRepository = learningMaterialRepository;
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.flashcardDeckRepository = flashcardDeckRepository;
        this.flashcardRepository = flashcardRepository;
        this.flashcardProgressRepository = flashcardProgressRepository;
        this.summaryRepository = summaryRepository;
        this.smartNoteRepository = smartNoteRepository;
        this.studyTaskRepository = studyTaskRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional(readOnly = true)
    public PlannerResponse getPlanner() {
        Student student = currentStudent();

        List<PlannerClassResponse> classes = loadClasses(student);
        List<PlannerMaterialResponse> materials = loadMaterials(student);
        List<PlannerQuizResponse> quizzes = loadQuizzes(student);
        List<PlannerFlashcardResponse> flashcards = loadFlashcards(student);
        List<PlannerResourceResponse> summaries = loadSummaries(student);
        List<PlannerResourceResponse> notes = loadNotes(student);
        List<StudyTaskResponse> tasks = studyTaskRepository
                .findByStudentOrderByDueDateAscDueTimeAscCreatedAtDesc(student)
                .stream()
                .map(StudyTaskResponse::from)
                .toList();

        List<RecommendationResponse> recommendations = buildRecommendations(materials, quizzes, flashcards, tasks);

        return new PlannerResponse(classes, materials, quizzes, flashcards, summaries, notes, tasks, recommendations);
    }

    private List<PlannerClassResponse> loadClasses(Student student) {
        String section = student.getSection();
        if (section == null || section.isBlank()) section = "Second Year A";
        return timetableEntryRepository.findBySectionAndAcademicYearAndSemester(section, ACADEMIC_YEAR, SEMESTER).stream()
                .sorted(Comparator.comparingInt((TimetableEntry e) -> DAYS.indexOf(e.getDayOfWeek()))
                        .thenComparing(TimetableEntry::getStartTime))
                .map(e -> new PlannerClassResponse(
                        e.getDayOfWeek(),
                        e.getSubject().getCode(),
                        e.getSubject().getName(),
                        e.getSubject().getLecturer(),
                        e.getStartTime().format(TIME_FORMAT),
                        e.getEndTime().format(TIME_FORMAT),
                        e.getRoom(),
                        e.getClassType()))
                .toList();
    }

    private List<PlannerMaterialResponse> loadMaterials(Student student) {
        List<LearningMaterial> materials = learningMaterialRepository.findByStudentOrderByCreatedAtDesc(student);
        Set<Long> readyIds = materials.stream()
                .filter(m -> m.getStatus() == LearningMaterialStatus.READY)
                .map(LearningMaterial::getId)
                .collect(Collectors.toSet());

        Set<Long> summaryIds = summaryRepository.findByStudentOrderByUpdatedAtDesc(student).stream()
                .flatMap(s -> s.getMaterialIds().stream())
                .collect(Collectors.toSet());
        Set<Long> noteIds = smartNoteRepository.findByStudentOrderByUpdatedAtDesc(student).stream()
                .flatMap(n -> n.getMaterialIds().stream())
                .collect(Collectors.toSet());
        Set<Long> deckIds = flashcardDeckRepository.findByStudentOrderByUpdatedAtDesc(student).stream()
                .flatMap(d -> d.getMaterialIds().stream())
                .collect(Collectors.toSet());
        Set<Long> quizIds = quizRepository.findByStudentOrderByUpdatedAtDesc(student).stream()
                .flatMap(q -> q.getMaterialIds().stream())
                .collect(Collectors.toSet());

        return materials.stream()
                .map(m -> new PlannerMaterialResponse(
                        m.getId(),
                        m.getTitle(),
                        m.getStatus().name(),
                        m.getCreatedAt().toLocalDate().toString(),
                        readyIds.contains(m.getId()) && summaryIds.contains(m.getId()),
                        readyIds.contains(m.getId()) && noteIds.contains(m.getId()),
                        readyIds.contains(m.getId()) && deckIds.contains(m.getId()),
                        readyIds.contains(m.getId()) && quizIds.contains(m.getId())))
                .toList();
    }

    private List<PlannerQuizResponse> loadQuizzes(Student student) {
        return quizRepository.findByStudentOrderByUpdatedAtDesc(student).stream()
                .map(q -> {
                    List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndStudentOrderByStartedAtDesc(q.getId(), student);
                    List<QuizAttempt> completed = attempts.stream().filter(a -> a.getCompletedAt() != null).toList();
                    int best = completed.stream()
                            .mapToInt(a -> Math.round(100f * a.getScore() / Math.max(1, a.getTotalQuestions())))
                            .max()
                            .orElse(0);
                    return new PlannerQuizResponse(q.getId(), q.getTitle(), completed.size(), completed.isEmpty() ? null : best, !completed.isEmpty());
                })
                .toList();
    }

    private List<PlannerFlashcardResponse> loadFlashcards(Student student) {
        List<FlashcardDeck> decks = flashcardDeckRepository.findByStudentOrderByUpdatedAtDesc(student);
        List<Long> deckIds = decks.stream().map(FlashcardDeck::getId).toList();

        Map<Long, Long> totalByDeck = new HashMap<>();
        Map<Long, Set<Long>> deckFlashcardIds = new HashMap<>();
        List<Flashcard> allCards = new ArrayList<>();
        Map<Long, FlashcardDeck> deckOfCard = new HashMap<>();
        for (FlashcardDeck deck : decks) {
            List<Flashcard> cards = flashcardRepository.findByDeckIdOrderByOrderIndexAsc(deck.getId());
            totalByDeck.put(deck.getId(), (long) cards.size());
            deckFlashcardIds.put(deck.getId(), cards.stream().map(Flashcard::getId).collect(Collectors.toSet()));
            allCards.addAll(cards);
            for (Flashcard card : cards) deckOfCard.put(card.getId(), deck);
        }

        Map<Flashcard, FlashcardProgress> progressByCard = allCards.isEmpty()
                ? Map.of()
                : flashcardProgressRepository.findAllByStudentAndFlashcardIn(student, allCards).stream()
                        .collect(Collectors.toMap(FlashcardProgress::getFlashcard, p -> p, (a, b) -> a));

        return decks.stream()
                .map(deck -> {
                    Set<Long> cardIds = deckFlashcardIds.getOrDefault(deck.getId(), Set.of());
                    long learned = cardIds.stream()
                            .map(id -> deckOfCard.get(id))
                            .filter(java.util.Objects::nonNull)
                            .filter(card -> {
                                FlashcardProgress p = progressByCard.get(card);
                                return p != null && p.isLearned();
                            })
                            .count();
                    return new PlannerFlashcardResponse(
                            deck.getId(),
                            deck.getId(),
                            deck.getTitle(),
                            Math.toIntExact(totalByDeck.getOrDefault(deck.getId(), 0L)),
                            (int) learned);
                })
                .toList();
    }

    private List<PlannerResourceResponse> loadSummaries(Student student) {
        return summaryRepository.findByStudentOrderByUpdatedAtDesc(student).stream()
                .map(s -> new PlannerResourceResponse(s.getId(), s.getTitle(), "summary", s.getUpdatedAt().toString()))
                .toList();
    }

    private List<PlannerResourceResponse> loadNotes(Student student) {
        return smartNoteRepository.findByStudentOrderByUpdatedAtDesc(student).stream()
                .map(n -> new PlannerResourceResponse(n.getId(), n.getTitle(), "notes", n.getUpdatedAt().toString()))
                .toList();
    }

    private List<RecommendationResponse> buildRecommendations(
            List<PlannerMaterialResponse> materials,
            List<PlannerQuizResponse> quizzes,
            List<PlannerFlashcardResponse> flashcards,
            List<StudyTaskResponse> tasks) {
        List<RecommendationResponse> recommendations = new ArrayList<>();
        int rank = 0;

        Comparator<PlannerMaterialResponse> byNewest = Comparator
                .comparing(PlannerMaterialResponse::uploadedAt)
                .reversed();

        List<PlannerMaterialResponse> reviewed = materials.stream()
                .filter(m -> m.hasSummary() || m.hasNotes() || m.hasFlashcards() || m.hasQuiz())
                .sorted(byNewest)
                .toList();

        for (PlannerMaterialResponse m : reviewed) {
            recommendations.add(new RecommendationResponse(
                    "material-" + m.id(),
                    "Review " + m.title(),
                    "Read the summary and smart notes for this lecture",
                    "material",
                    ++rank,
                    m.id(),
                    null, null));
        }

        for (PlannerQuizResponse q : quizzes) {
            if (!q.completed()) {
                recommendations.add(new RecommendationResponse(
                        "quiz-" + q.id(),
                        "Complete " + q.title(),
                        "Quiz not attempted yet",
                        "quiz",
                        ++rank,
                        q.id(),
                        null, null));
            }
        }

        for (PlannerFlashcardResponse f : flashcards) {
            if (f.learned() < f.total()) {
                recommendations.add(new RecommendationResponse(
                        "flashcards-" + f.deckId(),
                        "Review " + (f.total() - f.learned()) + " flashcards",
                        f.title(),
                        "flashcards",
                        ++rank,
                        f.deckId(),
                        null, null));
            }
        }

        for (PlannerMaterialResponse m : materials) {
            if ("READY".equals(m.status()) && !m.hasSummary() && !m.hasNotes() && !m.hasFlashcards() && !m.hasQuiz()) {
                recommendations.add(new RecommendationResponse(
                        "process-" + m.id(),
                        "Process " + m.title(),
                        "Generate a summary, notes, flashcards or quiz for this lecture",
                        "material",
                        ++rank,
                        m.id(),
                        null, null));
            }
        }

        for (StudyTaskResponse task : tasks) {
            if (!"todo".equals(task.status())) continue;
            recommendations.add(RecommendationResponse.studentTask(task, StudyTaskPriority.valueOf(task.priority().toUpperCase())));
        }

        recommendations.sort(Comparator.comparingInt(RecommendationResponse::priority));

        return recommendations.stream().limit(8).toList();
    }

    private static String priorityOrder(String priority) {
        return switch (priority) {
            case "high" -> "0";
            case "medium" -> "1";
            default -> "2";
        };
    }

    private Student currentStudent() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated student not found."));
    }
}
