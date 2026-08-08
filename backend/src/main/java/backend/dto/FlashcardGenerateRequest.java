package backend.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record FlashcardGenerateRequest(@NotEmpty List<Long> materialIds) {
}