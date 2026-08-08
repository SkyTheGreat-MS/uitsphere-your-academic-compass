package backend.dto;

import backend.entity.Quiz;
import backend.entity.QuizQuestion;

import java.util.List;

public record QuizDetailResponse(
        QuizResponse quiz,
        List<QuizQuestionResponse> questions) {

    public static QuizDetailResponse from(Quiz quiz, List<QuizQuestion> questions) {
        List<QuizQuestionResponse> responses = questions.stream()
                .map(QuizQuestionResponse::from)
                .toList();
        return new QuizDetailResponse(QuizResponse.from(quiz, responses.size()), responses);
    }
}