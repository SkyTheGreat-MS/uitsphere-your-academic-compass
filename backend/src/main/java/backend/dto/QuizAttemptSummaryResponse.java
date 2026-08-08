package backend.dto;

import backend.entity.QuizAttempt;

public record QuizAttemptSummaryResponse(
        Long attemptId,
        Long quizId,
        int score,
        int totalQuestions,
        String startedAt,
        String completedAt) {

    public static QuizAttemptSummaryResponse from(QuizAttempt attempt) {
        return new QuizAttemptSummaryResponse(
                attempt.getId(),
                attempt.getQuiz().getId(),
                attempt.getScore(),
                attempt.getTotalQuestions(),
                attempt.getStartedAt() == null ? null : attempt.getStartedAt().toString(),
                attempt.getCompletedAt() == null ? null : attempt.getCompletedAt().toString());
    }
}