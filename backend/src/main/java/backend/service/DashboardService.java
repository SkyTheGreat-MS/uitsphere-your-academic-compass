package backend.service;

import backend.dto.DashboardResponse;
import backend.dto.LearningMaterialResponse;
import backend.entity.ChatSession;
import backend.entity.FlashcardDeck;
import backend.entity.LearningMaterial;
import backend.entity.LearningMaterialStatus;
import backend.entity.Quiz;
import backend.entity.QuizAttempt;
import backend.entity.SmartNote;
import backend.entity.Student;
import backend.entity.StudyTask;
import backend.entity.StudyTaskStatus;
import backend.entity.Summary;
import backend.repository.ChatSessionRepository;
import backend.repository.FlashcardDeckRepository;
import backend.repository.FlashcardProgressRepository;
import backend.repository.FlashcardRepository;
import backend.repository.LearningMaterialRepository;
import backend.repository.QuizAttemptRepository;
import backend.repository.QuizRepository;
import backend.repository.SmartNoteRepository;
import backend.repository.StudentRepository;
import backend.repository.StudyTaskRepository;
import backend.repository.SummaryRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class DashboardService {

    private final StudentRepository studentRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final FlashcardDeckRepository flashcardDeckRepository;
    private final FlashcardRepository flashcardRepository;
    private final FlashcardProgressRepository flashcardProgressRepository;
    private final LearningMaterialRepository learningMaterialRepository;
    private final SummaryRepository summaryRepository;
    private final SmartNoteRepository smartNoteRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final StudyTaskRepository studyTaskRepository;
    private final StudyStreakService studyStreakService;

    public DashboardService(
            StudentRepository studentRepository,
            QuizAttemptRepository quizAttemptRepository,
            QuizRepository quizRepository,
            FlashcardDeckRepository flashcardDeckRepository,
            FlashcardRepository flashcardRepository,
            FlashcardProgressRepository flashcardProgressRepository,
            LearningMaterialRepository learningMaterialRepository,
            SummaryRepository summaryRepository,
            SmartNoteRepository smartNoteRepository,
            ChatSessionRepository chatSessionRepository,
            StudyTaskRepository studyTaskRepository,
            StudyStreakService studyStreakService) {
        this.studentRepository = studentRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.quizRepository = quizRepository;
        this.flashcardDeckRepository = flashcardDeckRepository;
        this.flashcardRepository = flashcardRepository;
        this.flashcardProgressRepository = flashcardProgressRepository;
        this.learningMaterialRepository = learningMaterialRepository;
        this.summaryRepository = summaryRepository;
        this.smartNoteRepository = smartNoteRepository;
        this.chatSessionRepository = chatSessionRepository;
        this.studyTaskRepository = studyTaskRepository;
        this.studyStreakService = studyStreakService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        Student student = currentStudent();

        DashboardResponse.QuizStats quizStats = buildQuizStats(student);
        DashboardResponse.FlashcardStats flashcardStats = buildFlashcardStats(student);
        List<LearningMaterialResponse> recentMaterials = learningMaterialRepository
                .findByStudentOrderByCreatedAtDesc(student)
                .stream()
                .limit(5)
                .map(LearningMaterialResponse::from)
                .toList();
        List<DashboardResponse.RecentActivity> recentActivity = buildRecentActivity(student);
        DashboardResponse.StudyProgress studyProgress = buildStudyProgress(student, quizStats, flashcardStats);

        int currentStreak = studyStreakService.currentStreak(student);
        return new DashboardResponse(quizStats, flashcardStats, recentMaterials, recentActivity, studyProgress,
                currentStreak, studyStreakService.studiedToday(student),
                new DashboardResponse.StudyOverview(
                        allMaterialsCount(student),
                        summaryRepository.findByStudentOrderByUpdatedAtDesc(student).size(),
                        smartNoteRepository.findByStudentOrderByUpdatedAtDesc(student).size(),
                        flashcardDeckRepository.findByStudentOrderByUpdatedAtDesc(student).size(),
                        quizStats.completed(),
                        currentStreak));
    }

    private int allMaterialsCount(Student student) {
        return learningMaterialRepository.findByStudentOrderByCreatedAtDesc(student).size();
    }

    private DashboardResponse.QuizStats buildQuizStats(Student student) {
        List<QuizAttempt> completed = quizAttemptRepository
                .findByStudentAndCompletedAtIsNotNullOrderByCompletedAtDesc(student);

        int completedCount = completed.size();
        int best = 0;
        int sum = 0;
        for (QuizAttempt attempt : completed) {
            int percent = Math.round(100f * attempt.getScore() / Math.max(1, attempt.getTotalQuestions()));
            sum += percent;
            best = Math.max(best, percent);
        }
        int average = completedCount == 0 ? 0 : Math.round((float) sum / completedCount);

        DashboardResponse.QuizStats.LatestResult latestResult = null;
        if (completedCount > 0) {
            QuizAttempt latest = completed.get(0);
            latestResult = new DashboardResponse.QuizStats.LatestResult(
                    latest.getQuiz().getTitle(),
                    Math.round(100f * latest.getScore() / Math.max(1, latest.getTotalQuestions())),
                    String.valueOf(latest.getCompletedAt()));
        }

        return new DashboardResponse.QuizStats(completedCount, average, best, latestResult);
    }

    private DashboardResponse.FlashcardStats buildFlashcardStats(Student student) {
        List<FlashcardDeck> decks = flashcardDeckRepository.findByStudentOrderByUpdatedAtDesc(student);
        int total = 0;
        for (FlashcardDeck deck : decks) {
            total += (int) flashcardRepository.countByDeckId(deck.getId());
        }
        long learned = flashcardProgressRepository.countByStudentAndLearned(student, true);
        return new DashboardResponse.FlashcardStats(decks.size(), total, (int) learned);
    }

    private List<DashboardResponse.RecentActivity> buildRecentActivity(Student student) {
        List<DashboardResponse.RecentActivity> activity = new ArrayList<>();

        for (ChatSession session : chatSessionRepository.findByStudentOrderByUpdatedAtDesc(student)) {
            activity.add(new DashboardResponse.RecentActivity(
                    "tutor-" + session.getId(), "tutor", session.getTitle(), String.valueOf(session.getUpdatedAt())));
        }
        for (Summary summary : summaryRepository.findByStudentOrderByUpdatedAtDesc(student)) {
            activity.add(new DashboardResponse.RecentActivity(
                    "summary-" + summary.getId(), "summary", summary.getTitle(), String.valueOf(summary.getUpdatedAt())));
        }
        for (SmartNote note : smartNoteRepository.findByStudentOrderByUpdatedAtDesc(student)) {
            activity.add(new DashboardResponse.RecentActivity(
                    "notes-" + note.getId(), "notes", note.getTitle(), String.valueOf(note.getUpdatedAt())));
        }
        for (FlashcardDeck deck : flashcardDeckRepository.findByStudentOrderByUpdatedAtDesc(student)) {
            activity.add(new DashboardResponse.RecentActivity(
                    "flashcards-" + deck.getId(), "flashcards", deck.getTitle(), String.valueOf(deck.getUpdatedAt())));
        }
        for (Quiz quiz : quizRepository.findByStudentOrderByUpdatedAtDesc(student)) {
            activity.add(new DashboardResponse.RecentActivity(
                    "quiz-" + quiz.getId(), "quiz", quiz.getTitle(), String.valueOf(quiz.getUpdatedAt())));
        }
        for (StudyTask task : studyTaskRepository.findByStudentOrderByDueDateAscDueTimeAscCreatedAtDesc(student)) {
            if (task.getStatus() == StudyTaskStatus.COMPLETED) {
                activity.add(new DashboardResponse.RecentActivity(
                        "task-" + task.getId(), "task", task.getTitle(),
                        String.valueOf(task.getUpdatedAt() == null ? task.getCreatedAt() : task.getUpdatedAt())));
            }
        }

        activity.sort(Comparator.comparing(act -> act.at(), (a, b) -> {
            LocalDateTime first = LocalDateTime.parse(a);
            LocalDateTime second = LocalDateTime.parse(b);
            return second.compareTo(first);
        }));

        return activity.stream().limit(5).toList();
    }

    private DashboardResponse.StudyProgress buildStudyProgress(
            Student student,
            DashboardResponse.QuizStats quizStats,
            DashboardResponse.FlashcardStats flashcardStats) {
        List<LearningMaterial> allMaterials = learningMaterialRepository.findByStudentOrderByCreatedAtDesc(student);
        long readyMaterials = allMaterials.stream()
                .filter(material -> material.getStatus() == LearningMaterialStatus.READY)
                .count();

        List<DashboardResponse.StudyProgress.Component> components = new ArrayList<>();
        if (quizStats.completed() > 0) {
            components.add(new DashboardResponse.StudyProgress.Component("Quiz average", quizStats.averageScore()));
        }
        if (flashcardStats.total() > 0) {
            components.add(new DashboardResponse.StudyProgress.Component(
                    "Flashcards learned",
                    Math.round(100f * flashcardStats.learned() / flashcardStats.total())));
        }
        if (!allMaterials.isEmpty()) {
            components.add(new DashboardResponse.StudyProgress.Component(
                    "Material coverage",
                    Math.round(100f * readyMaterials / allMaterials.size())));
        }

        Integer overall = null;
        if (!components.isEmpty()) {
            int sum = 0;
            for (DashboardResponse.StudyProgress.Component component : components) {
                sum += component.percent();
            }
            overall = Math.round((float) sum / components.size());
        }

        return new DashboardResponse.StudyProgress(overall, components);
    }

    private Student currentStudent() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank() || "anonymousUser".equals(auth.getName())) {
            throw new LearningMaterialException("User is not authenticated.");
        }
        String email = auth.getName();
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new LearningMaterialException("Authenticated student not found."));
    }
}
