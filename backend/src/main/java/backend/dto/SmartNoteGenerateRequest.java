package backend.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record SmartNoteGenerateRequest(@NotEmpty List<Long> materialIds) { }
