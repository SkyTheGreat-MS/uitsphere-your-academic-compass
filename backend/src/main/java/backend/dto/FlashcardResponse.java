package backend.dto;

import backend.entity.Flashcard;
import backend.entity.FlashcardDifficulty;

public record FlashcardResponse(
        Long id,
        Long deckId,
        String question,
        String answer,
        FlashcardDifficulty difficulty,
        int order,
        boolean learned) {

    public static FlashcardResponse from(Flashcard card, boolean learned) {
        return new FlashcardResponse(
                card.getId(),
                card.getDeck().getId(),
                card.getQuestion(),
                card.getAnswer(),
                card.getDifficulty(),
                card.getOrderIndex(),
                learned);
    }
}