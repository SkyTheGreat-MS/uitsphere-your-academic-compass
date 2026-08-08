package backend.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SummaryGenerateRequest(@NotEmpty List<Long> materialIds) {
}
