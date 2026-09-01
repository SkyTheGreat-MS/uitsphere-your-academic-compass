package backend.controller;

import backend.dto.QuizAnswerRequest;
import backend.dto.QuizAnswerResponse;
import backend.dto.QuizAttemptResponse;
import backend.dto.QuizAttemptStartResponse;
import backend.dto.QuizAttemptSummaryResponse;
import backend.dto.QuizDetailResponse;
import backend.dto.QuizGenerateRequest;
import backend.dto.QuizResponse;
import backend.service.GroqServiceException;
import backend.service.LearningMaterialException;
import backend.service.QuizGenerationException;
import backend.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai/quiz")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/generate")
    public QuizDetailResponse generate(@Valid @RequestBody QuizGenerateRequest request) {
        return quizService.generate(request);
    }

    @GetMapping
    public List<QuizResponse> list() {
        return quizService.list();
    }

    @GetMapping("/{quizId}")
    public QuizDetailResponse getQuiz(@PathVariable Long quizId) {
        return quizService.getQuiz(quizId);
    }

    @DeleteMapping("/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long quizId) {
        quizService.deleteQuiz(quizId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{quizId}/attempt")
    public QuizAttemptStartResponse startAttempt(@PathVariable Long quizId) {
        return quizService.startAttempt(quizId);
    }

    @GetMapping("/{quizId}/attempts")
    public List<QuizAttemptSummaryResponse> attempts(@PathVariable Long quizId) {
        return quizService.attempts(quizId);
    }

    @PostMapping("/attempt/{attemptId}/answer")
    public QuizAnswerResponse answer(@PathVariable Long attemptId, @Valid @RequestBody QuizAnswerRequest request) {
        return quizService.answer(attemptId, request);
    }

    @PostMapping("/attempt/{attemptId}/complete")
    public QuizAttemptResponse complete(@PathVariable Long attemptId) {
        return quizService.complete(attemptId);
    }

    @ExceptionHandler(LearningMaterialException.class)
    public ResponseEntity<ErrorResponse> handleMaterialError(LearningMaterialException ex) {
        HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler({ GroqServiceException.class, QuizGenerationException.class })
    public ResponseEntity<ErrorResponse> handleGenerationError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new ErrorResponse(ex.getMessage()));
    }

    public record ErrorResponse(String error) {
    }
}