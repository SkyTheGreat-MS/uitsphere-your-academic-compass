package backend.dto;

import backend.entity.QuizAttempt;

import java.util.List;

public record QuizAttemptResponse(
        Long attemptId,
        Long quizId,
        int score,
        int totalQuestions,
        int correctCount,
        int incorrectCount,
        String startedAt,
        String completedAt,
        List<QuizReviewItemResponse> review) {

    public static QuizAttemptResponse from(QuizAttempt attempt, int correctCount, int incorrectCount, List<QuizReviewItemResponse> review) {
        return new QuizAttemptResponse(
                attempt.getId(),
                attempt.getQuiz().getId(),
                attempt.getScore(),
                attempt.getTotalQuestions(),
                correctCount,
                incorrectCount,
                attempt.getStartedAt() == null ? null : attempt.getStartedAt().toString(),
                attempt.getCompletedAt() == null ? null : attempt.getCompletedAt().toString(),
                review);
    }
}