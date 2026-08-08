package backend.dto;

import backend.entity.FlashcardDeck;

import java.util.List;

public record FlashcardDeckDetailResponse(
        FlashcardDeckResponse deck,
        List<FlashcardResponse> cards,
        long learnedCount) {

    public static FlashcardDeckDetailResponse from(FlashcardDeck deck, List<FlashcardResponse> cards, long learnedCount) {
        return new FlashcardDeckDetailResponse(
                FlashcardDeckResponse.from(deck, cards.size()),
                cards,
                learnedCount);
    }
}