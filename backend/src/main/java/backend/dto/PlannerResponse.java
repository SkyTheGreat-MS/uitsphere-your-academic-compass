package backend.dto;

import java.util.List;

public record PlannerResponse(
        List<PlannerClassResponse> classes,
        List<PlannerMaterialResponse> materials,
        List<PlannerQuizResponse> quizzes,
        List<PlannerFlashcardResponse> flashcards,
        List<PlannerResourceResponse> summaries,
        List<PlannerResourceResponse> notes,
        List<StudyTaskResponse> tasks,
        List<RecommendationResponse> recommendations) {
}
