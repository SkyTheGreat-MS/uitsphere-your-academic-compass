package backend.dto;

public record PlannerFlashcardResponse(
        Long id,
        Long deckId,
        String title,
        int total,
        int learned) {
}
