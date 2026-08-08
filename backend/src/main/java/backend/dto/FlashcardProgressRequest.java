package backend.dto;

import jakarta.validation.constraints.NotNull;

public record FlashcardProgressRequest(@NotNull Long flashcardId, boolean learned) {
}