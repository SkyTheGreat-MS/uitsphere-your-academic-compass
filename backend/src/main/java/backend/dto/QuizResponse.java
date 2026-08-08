package backend.dto;

import backend.entity.Quiz;
import backend.entity.QuizQuestion;

import java.util.List;

public record QuizResponse(
        Long id,
        Long studentId,
        String title,
        List<Long> materialIds,
        int questionCount,
        String createdAt,
        String updatedAt) {

    public static QuizResponse from(Quiz quiz, int questionCount) {
        return new QuizResponse(
                quiz.getId(),
                quiz.getStudent().getId(),
                quiz.getTitle(),
                quiz.getMaterialIds(),
                questionCount,
                quiz.getCreatedAt().toString(),
                quiz.getUpdatedAt().toString());
    }

    public static QuizResponse from(Quiz quiz, List<QuizQuestion> questions) {
        return from(quiz, questions.size());
    }
}