package backend.dto;

import backend.entity.QuizCorrectOption;

public record QuizReviewItemResponse(
        Long questionId,
        String question,
        QuizCorrectOption selectedOption,
        QuizCorrectOption correctOption,
        boolean correct,
        String explanation) {
}