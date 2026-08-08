package backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ChatMessageRequest(
        @NotNull Long sessionId,
        @NotBlank String message,
        List<Long> materialIds) {
}
