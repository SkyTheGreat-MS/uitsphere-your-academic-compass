package backend.dto;

import jakarta.validation.constraints.NotNull;

import backend.entity.QuizCorrectOption;

public record QuizAnswerRequest(
        @NotNull Long questionId,
        @NotNull QuizCorrectOption selectedOption) {
}