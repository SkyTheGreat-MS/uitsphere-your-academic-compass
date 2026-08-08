package backend.dto;

import backend.entity.FlashcardDeck;

import java.util.List;

public record FlashcardDeckResponse(
        Long id,
        Long studentId,
        String title,
        List<Long> materialIds,
        long cardCount,
        String createdAt,
        String updatedAt) {

    public static FlashcardDeckResponse from(FlashcardDeck deck, long cardCount) {
        return new FlashcardDeckResponse(
                deck.getId(),
                deck.getStudent().getId(),
                deck.getTitle(),
                deck.getMaterialIds(),
                cardCount,
                deck.getCreatedAt().toString(),
                deck.getUpdatedAt().toString());
    }
}