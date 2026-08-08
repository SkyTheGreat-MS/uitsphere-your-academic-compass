package backend.service;

import backend.dto.QuizAnswerRequest;
import backend.dto.QuizAnswerResponse;
import backend.dto.QuizAttemptResponse;
import backend.dto.QuizAttemptStartResponse;
import backend.dto.QuizAttemptSummaryResponse;
import backend.dto.QuizDetailResponse;
import backend.dto.QuizGenerateRequest;
import backend.dto.QuizResponse;
import backend.dto.QuizReviewItemResponse;
import backend.entity.Quiz;
import backend.entity.QuizAnswer;
import backend.entity.QuizAttempt;
import backend.entity.QuizCorrectOption;
import backend.entity.QuizQuestion;
import backend.entity.Student;
import backend.repository.QuizAnswerRepository;
import backend.repository.QuizAttemptRepository;
import backend.repository.QuizQuestionRepository;
import backend.repository.QuizRepository;
import backend.repository.StudentRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizAnswerRepository answerRepository;
    private final StudentRepository studentRepository;
    private final AIContentGenerationService generationService;
    private final QuizResponseParser responseParser;

    public QuizService(
            QuizRepository quizRepository,
            QuizQuestionRepository questionRepository,
            QuizAttemptRepository attemptRepository,
            QuizAnswerRepository answerRepository,
            StudentRepository studentRepository,
            AIContentGenerationService generationService,
            QuizResponseParser responseParser) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.studentRepository = studentRepository;
        this.generationService = generationService;
        this.responseParser = responseParser;
    }

    @Transactional
    public QuizDetailResponse generate(QuizGenerateRequest request) {
        Student student = currentStudent();
        List<Long> materialIds = request.materialIds().stream().distinct().toList();
        int questionCount = request.questionCount() == null ? 10 : request.questionCount();

        String rawContent = generationService.generateQuiz(materialIds, questionCount);
        List<QuizResponseParser.ParsedQuestion> parsed = responseParser.parse(rawContent, questionCount);

        Quiz quiz = new Quiz();
        quiz.setStudent(student);
        quiz.setTitle(materialIds.size() == 1 ? "Lecture quiz" : "Combined lecture quiz");
        quiz.setMaterialIds(materialIds);
        quiz = quizRepository.save(quiz);

        int orderIndex = 0;
        List<QuizQuestion> savedQuestions = new ArrayList<>();
        for (QuizResponseParser.ParsedQuestion parsedQuestion : parsed) {
            QuizQuestion question = new QuizQuestion();
            question.setQuiz(quiz);
            question.setQuestion(parsedQuestion.question());
            question.setOptionA(parsedQuestion.options().get(0));
            question.setOptionB(parsedQuestion.options().get(1));
            question.setOptionC(parsedQuestion.options().get(2));
            question.setOptionD(parsedQuestion.options().get(3));
            question.setCorrectOption(parsedQuestion.correctOption());
            question.setExplanation(parsedQuestion.explanation());
            question.setDifficulty(parsedQuestion.difficulty());
            question.setOrderIndex(orderIndex++);
            savedQuestions.add(questionRepository.save(question));
        }

        return QuizDetailResponse.from(quiz, savedQuestions);
    }

    public List<QuizResponse> list() {
        return quizRepository.findByStudentOrderByUpdatedAtDesc(currentStudent())
                .stream()
                .map(quiz -> QuizResponse.from(quiz, (int) questionRepository.countByQuizId(quiz.getId())))
                .toList();
    }

    @Transactional
    public QuizDetailResponse getQuiz(Long quizId) {
        Quiz quiz = quizRepository.findByIdAndStudent(quizId, currentStudent())
                .orElseThrow(() -> new LearningMaterialException("Quiz not found."));
        List<QuizQuestion> questions = questionRepository.findByQuizIdOrderByOrderIndexAsc(quizId);
        return QuizDetailResponse.from(quiz, questions);
    }

    @Transactional
    public void deleteQuiz(Long quizId) {
        Quiz quiz = quizRepository.findByIdAndStudent(quizId, currentStudent())
                .orElseThrow(() -> new LearningMaterialException("Quiz not found."));
        quizRepository.delete(quiz);
    }

    @Transactional
    public QuizAttemptStartResponse startAttempt(Long quizId) {
        Student student = currentStudent();
        Quiz quiz = quizRepository.findByIdAndStudent(quizId, student)
                .orElseThrow(() -> new LearningMaterialException("Quiz not found."));

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setStudent(student);
        attempt.setScore(0);
        attempt.setTotalQuestions((int) questionRepository.countByQuizId(quizId));
        attempt.setStartedAt(LocalDateTime.now());
        return QuizAttemptStartResponse.from(attemptRepository.save(attempt));
    }

    @Transactional
    public QuizAnswerResponse answer(Long attemptId, QuizAnswerRequest request) {
        Student student = currentStudent();
        QuizAttempt attempt = attemptRepository.findByIdAndStudent(attemptId, student)
                .orElseThrow(() -> new LearningMaterialException("Attempt not found."));
        if (attempt.getCompletedAt() != null) {
            throw new LearningMaterialException("This attempt is already completed.");
        }

        QuizQuestion question = questionRepository.findById(request.questionId())
                .orElseThrow(() -> new LearningMaterialException("Quiz question not found."));
        if (!question.getQuiz().getId().equals(attempt.getQuiz().getId())) {
            throw new LearningMaterialException("Quiz question does not belong to this quiz.");
        }

        QuizCorrectOption selected = request.selectedOption();
        boolean correct = selected == question.getCorrectOption();

        QuizAnswer answer = answerRepository.findOneByAttemptIdAndQuestionId(attemptId, request.questionId())
                .orElseGet(() -> {
                    QuizAnswer created = new QuizAnswer();
                    created.setAttempt(attempt);
                    created.setQuestionId(request.questionId());
                    return created;
                });
        answer.setSelectedOption(selected);
        answer.setCorrect(correct);
        return QuizAnswerResponse.from(answerRepository.save(answer));
    }

    @Transactional
    public QuizAttemptResponse complete(Long attemptId) {
        Student student = currentStudent();
        QuizAttempt attempt = attemptRepository.findByIdAndStudent(attemptId, student)
                .orElseThrow(() -> new LearningMaterialException("Attempt not found."));

        List<QuizQuestion> questions = questionRepository.findByQuizIdOrderByOrderIndexAsc(attempt.getQuiz().getId());
        Map<Long, QuizQuestion> questionsById = new HashMap<>();
        for (QuizQuestion question : questions) {
            questionsById.put(question.getId(), question);
        }

        List<QuizAnswer> answers = answerRepository.findByAttemptId(attemptId);
        Map<Long, QuizAnswer> answersByQuestion = new HashMap<>();
        for (QuizAnswer answer : answers) {
            QuizQuestion question = questionsById.get(answer.getQuestionId());
            boolean correct = question != null && answer.getSelectedOption() == question.getCorrectOption();
            answer.setCorrect(correct);
            answerRepository.save(answer);
            answersByQuestion.put(answer.getQuestionId(), answer);
        }

        int correctCount = (int) answers.stream().filter(QuizAnswer::isCorrect).count();
        int totalQuestions = questions.size();
        int incorrectCount = Math.max(0, totalQuestions - correctCount);

        attempt.setScore(correctCount);
        attempt.setTotalQuestions(totalQuestions);
        attempt.setCompletedAt(LocalDateTime.now());
        attemptRepository.save(attempt);

        List<QuizReviewItemResponse> review = new ArrayList<>();
        for (QuizQuestion question : questions) {
            QuizAnswer answer = answersByQuestion.get(question.getId());
            QuizCorrectOption selected = answer == null ? null : answer.getSelectedOption();
            boolean correct = selected != null && selected == question.getCorrectOption();
            review.add(new QuizReviewItemResponse(
                    question.getId(),
                    question.getQuestion(),
                    selected,
                    question.getCorrectOption(),
                    correct,
                    question.getExplanation()));
        }

        return QuizAttemptResponse.from(attempt, correctCount, incorrectCount, review);
    }

    public List<QuizAttemptSummaryResponse> attempts(Long quizId) {
        Student student = currentStudent();
        quizRepository.findByIdAndStudent(quizId, student)
                .orElseThrow(() -> new LearningMaterialException("Quiz not found."));
        return attemptRepository.findByQuizIdAndStudentOrderByStartedAtDesc(quizId, student)
                .stream()
                .map(QuizAttemptSummaryResponse::from)
                .toList();
    }

    private Student currentStudent() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new LearningMaterialException("Authenticated student not found."));
    }
}