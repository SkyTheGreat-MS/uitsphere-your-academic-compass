package backend.dto;

import backend.entity.QuizAnswer;
import backend.entity.QuizCorrectOption;

public record QuizAnswerResponse(
        Long id,
        Long attemptId,
        Long questionId,
        QuizCorrectOption selectedOption,
        boolean correct) {

    public static QuizAnswerResponse from(QuizAnswer answer) {
        return new QuizAnswerResponse(
                answer.getId(),
                answer.getAttempt().getId(),
                answer.getQuestionId(),
                answer.getSelectedOption(),
                answer.isCorrect());
    }
}