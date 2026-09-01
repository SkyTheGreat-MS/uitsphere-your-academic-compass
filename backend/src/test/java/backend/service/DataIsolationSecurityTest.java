package backend.service;

import backend.dto.ChatMessageRequest;
import backend.entity.ChatSession;
import backend.entity.Flashcard;
import backend.entity.FlashcardDeck;
import backend.entity.Student;
import backend.exception.ChatException;
import backend.repository.ChatMessageRepository;
import backend.repository.ChatSessionRepository;
import backend.repository.FlashcardDeckRepository;
import backend.repository.FlashcardProgressRepository;
import backend.repository.FlashcardRepository;
import backend.repository.LearningMaterialRepository;
import backend.repository.QuizAnswerRepository;
import backend.repository.QuizAttemptRepository;
import backend.repository.QuizQuestionRepository;
import backend.repository.QuizRepository;
import backend.repository.SmartNoteRepository;
import backend.repository.StudentRepository;
import backend.repository.SummaryRepository;
import backend.dto.ClaimResponse;
import backend.entity.ClaimStatus;
import backend.entity.LostFoundClaim;
import backend.entity.LostFoundPost;
import backend.repository.ClaimMessageRepository;
import backend.repository.LostFoundClaimRepository;
import backend.repository.LostFoundPostRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DataIsolationSecurityTest {

    @Mock private StudentRepository studentRepository;
    @Mock private LearningMaterialRepository materialRepository;
    @Mock private SummaryRepository summaryRepository;
    @Mock private SmartNoteRepository smartNoteRepository;
    @Mock private ChatSessionRepository chatSessionRepository;
    @Mock private ChatMessageRepository chatMessageRepository;
    @Mock private FlashcardDeckRepository flashcardDeckRepository;
    @Mock private FlashcardRepository flashcardRepository;
    @Mock private FlashcardProgressRepository flashcardProgressRepository;
    @Mock private QuizRepository quizRepository;
    @Mock private QuizQuestionRepository quizQuestionRepository;
    @Mock private QuizAttemptRepository quizAttemptRepository;
    @Mock private QuizAnswerRepository quizAnswerRepository;
    @Mock private DocumentProcessingService documentProcessingService;
    @Mock private NotificationService notificationService;
    @Mock private MaterialContextService materialContextService;
    @Mock private GroqService groqService;
    @Mock private StudyStreakService studyStreakService;
    @Mock private AIContentGenerationService generationService;
    @Mock private FlashcardResponseParser flashcardResponseParser;
    @Mock private QuizResponseParser quizResponseParser;
    @Mock private JdbcTemplate jdbcTemplate;
    @Mock private LostFoundPostRepository postRepository;
    @Mock private LostFoundClaimRepository claimRepository;
    @Mock private ClaimMessageRepository messageRepository;

    private Student studentA;
    private Student studentB;

    @BeforeEach
    void setUp() {
        studentA = new Student();
        ReflectionTestUtils.setField(studentA, "id", 1L);
        studentA.setEmail("studentA@university.edu");

        studentB = new Student();
        ReflectionTestUtils.setField(studentB, "id", 2L);
        studentB.setEmail("studentB@university.edu");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Student student) {
        when(studentRepository.findByEmail(student.getEmail())).thenReturn(Optional.of(student));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(student.getEmail(), null));
    }

    @Test
    void accountBCannotAccessOrDeleteAccountAMaterials() {
        authenticateAs(studentB);
        when(materialRepository.findByIdAndStudent(100L, studentB)).thenReturn(Optional.empty());

        LearningMaterialService service = new LearningMaterialService(
                materialRepository, studentRepository, documentProcessingService,
                notificationService, jdbcTemplate, "uploads");

        assertThatThrownBy(() -> service.getMaterial(100L))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("Learning material not found");

        assertThatThrownBy(() -> service.delete(100L))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("Learning material not found");

        verify(materialRepository, never()).delete(any());
    }

    @Test
    void accountBCannotAccessAccountAChatSessionOrMessages() {
        authenticateAs(studentB);
        when(chatSessionRepository.findByIdAndStudent(200L, studentB)).thenReturn(Optional.empty());

        ChatService service = new ChatService(
                chatSessionRepository, chatMessageRepository, materialRepository,
                studentRepository, materialContextService, groqService, studyStreakService);

        assertThatThrownBy(() -> service.getSession(200L))
                .isInstanceOf(ChatException.class)
                .hasMessageContaining("Chat session not found");

        assertThatThrownBy(() -> service.listMessages(200L))
                .isInstanceOf(ChatException.class)
                .hasMessageContaining("Chat session not found");

        assertThatThrownBy(() -> service.sendMessage(new ChatMessageRequest(200L, "Hello", null)))
                .isInstanceOf(ChatException.class)
                .hasMessageContaining("Chat session not found");

        assertThatThrownBy(() -> service.deleteSession(200L))
                .isInstanceOf(ChatException.class)
                .hasMessageContaining("Chat session not found");

        verify(chatMessageRepository, never()).save(any());
    }

    @Test
    void accountBCannotAccessOrDeleteAccountASummaries() {
        authenticateAs(studentB);
        when(summaryRepository.findByIdAndStudent(300L, studentB)).thenReturn(Optional.empty());

        SummaryService service = new SummaryService(
                summaryRepository, studentRepository, materialRepository, generationService, notificationService);

        assertThatThrownBy(() -> service.get(300L))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("Summary not found");

        assertThatThrownBy(() -> service.delete(300L))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("Summary not found");

        verify(summaryRepository, never()).delete(any());
    }

    @Test
    void accountBCannotAccessOrDeleteAccountASmartNotes() {
        authenticateAs(studentB);
        when(smartNoteRepository.findByIdAndStudent(400L, studentB)).thenReturn(Optional.empty());

        SmartNoteService service = new SmartNoteService(
                smartNoteRepository, studentRepository, materialRepository, generationService, notificationService);

        assertThatThrownBy(() -> service.get(400L))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("Smart note not found");

        assertThatThrownBy(() -> service.delete(400L))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("Smart note not found");

        verify(smartNoteRepository, never()).delete(any());
    }

    @Test
    void accountBCannotAccessOrDeleteAccountAFlashcardDecks() {
        authenticateAs(studentB);
        when(flashcardDeckRepository.findByIdAndStudent(500L, studentB)).thenReturn(Optional.empty());

        FlashcardService service = new FlashcardService(
                flashcardDeckRepository, flashcardRepository, flashcardProgressRepository,
                studentRepository, materialRepository, generationService, flashcardResponseParser,
                studyStreakService, notificationService);

        assertThatThrownBy(() -> service.getDeck(500L))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("Flashcard deck not found");

        assertThatThrownBy(() -> service.deleteDeck(500L))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("Flashcard deck not found");

        verify(flashcardDeckRepository, never()).delete(any());
    }

    @Test
    void accountBCannotMarkLearnedOnAccountAFlashcard() {
        authenticateAs(studentB);

        FlashcardDeck deckA = new FlashcardDeck();
        deckA.setStudent(studentA);

        Flashcard cardA = new Flashcard();
        ReflectionTestUtils.setField(cardA, "id", 555L);
        cardA.setDeck(deckA);

        when(flashcardRepository.findById(555L)).thenReturn(Optional.of(cardA));

        FlashcardService service = new FlashcardService(
                flashcardDeckRepository, flashcardRepository, flashcardProgressRepository,
                studentRepository, materialRepository, generationService, flashcardResponseParser,
                studyStreakService, notificationService);

        assertThatThrownBy(() -> service.markLearned(555L, true))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("Flashcard not found");

        verify(flashcardProgressRepository, never()).save(any());
    }

    @Test
    void accountBCannotAccessOrDeleteAccountAQuizzes() {
        authenticateAs(studentB);
        when(quizRepository.findByIdAndStudent(600L, studentB)).thenReturn(Optional.empty());

        QuizService service = new QuizService(
                quizRepository, quizQuestionRepository, quizAttemptRepository, quizAnswerRepository,
                studentRepository, materialRepository, generationService, quizResponseParser,
                studyStreakService, notificationService);

        assertThatThrownBy(() -> service.getQuiz(600L))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("Quiz not found");

        assertThatThrownBy(() -> service.deleteQuiz(600L))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("Quiz not found");

        assertThatThrownBy(() -> service.startAttempt(600L))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("Quiz not found");

        assertThatThrownBy(() -> service.attempts(600L))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("Quiz not found");

        verify(quizRepository, never()).delete(any());
    }

    @Test
    void accountBCannotUseAccountAMaterialInContextService() {
        authenticateAs(studentB);
        when(materialRepository.findByIdAndStudent(700L, studentB)).thenReturn(Optional.empty());

        MaterialContextService service = new MaterialContextService(materialRepository, studentRepository, 10000);

        assertThatThrownBy(() -> service.getMaterialContext(700L))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("Learning material not found");

        when(materialRepository.findByIdInAndStudent(List.of(700L), studentB)).thenReturn(List.of());

        assertThatThrownBy(() -> service.getMaterialContext(List.of(700L)))
                .isInstanceOf(LearningMaterialException.class)
                .hasMessageContaining("One or more learning materials were not found");
    }

    @Test
    void thirdPartyStudentCannotAccessClaimBetweenReporterAndClaimant() {
        Student studentC = new Student();
        ReflectionTestUtils.setField(studentC, "id", 3L);
        studentC.setEmail("studentC@university.edu");

        authenticateAs(studentC);

        LostFoundPost post = new LostFoundPost();
        ReflectionTestUtils.setField(post, "id", 800L);
        post.setReporter(studentA);
        post.setTitle("Lost Laptop");

        LostFoundClaim claim = new LostFoundClaim();
        ReflectionTestUtils.setField(claim, "id", 888L);
        claim.setPost(post);
        claim.setClaimant(studentB);
        claim.setStatus(ClaimStatus.ACCEPTED);

        when(claimRepository.findById(888L)).thenReturn(Optional.of(claim));

        LostFoundService service = new LostFoundService(
                postRepository, claimRepository, messageRepository,
                studentRepository, notificationService, "uploads");

        assertThatThrownBy(() -> service.getClaim(888L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("You are not part of this conversation.");
    }
}
