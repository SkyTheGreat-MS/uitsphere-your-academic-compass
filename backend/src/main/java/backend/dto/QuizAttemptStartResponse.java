package backend.dto;

import backend.entity.QuizAttempt;

public record QuizAttemptStartResponse(
        Long attemptId,
        Long quizId,
        int totalQuestions,
        String startedAt) {

    public static QuizAttemptStartResponse from(QuizAttempt attempt) {
        return new QuizAttemptStartResponse(
                attempt.getId(),
                attempt.getQuiz().getId(),
                attempt.getTotalQuestions(),
                attempt.getStartedAt().toString());
    }
}