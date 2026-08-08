package backend.dto;

import backend.entity.FlashcardProgress;

public record FlashcardProgressResponse(
        Long id,
        Long studentId,
        Long flashcardId,
        boolean learned,
        String lastReviewed) {

    public static FlashcardProgressResponse from(FlashcardProgress progress) {
        return new FlashcardProgressResponse(
                progress.getId(),
                progress.getStudent().getId(),
                progress.getFlashcard().getId(),
                progress.isLearned(),
                progress.getLastReviewed() == null ? null : progress.getLastReviewed().toString());
    }
}