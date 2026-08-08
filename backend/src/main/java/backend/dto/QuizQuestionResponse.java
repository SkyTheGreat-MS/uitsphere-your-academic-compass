package backend.dto;

import backend.entity.QuizCorrectOption;
import backend.entity.QuizDifficulty;
import backend.entity.QuizQuestion;

import java.util.List;

public record QuizQuestionResponse(
        Long id,
        Long quizId,
        String question,
        List<String> options,
        QuizCorrectOption correctOption,
        String explanation,
        QuizDifficulty difficulty,
        int order) {

    public static QuizQuestionResponse from(QuizQuestion q) {
        return new QuizQuestionResponse(
                q.getId(),
                q.getQuiz().getId(),
                q.getQuestion(),
                List.of(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()),
                q.getCorrectOption(),
                q.getExplanation(),
                q.getDifficulty(),
                q.getOrderIndex());
    }
}