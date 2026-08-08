package backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record QuizGenerateRequest(
        @NotEmpty List<Long> materialIds,
        @NotNull @Min(1) @Max(50) Integer questionCount) {
}