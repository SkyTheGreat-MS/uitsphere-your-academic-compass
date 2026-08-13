package backend.dto;

public record PlannerMaterialResponse(
        Long id,
        String title,
        String status,
        String uploadedAt,
        boolean hasSummary,
        boolean hasNotes,
        boolean hasFlashcards,
        boolean hasQuiz) {
}
