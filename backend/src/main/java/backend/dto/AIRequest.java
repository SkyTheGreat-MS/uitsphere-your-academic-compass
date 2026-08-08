package backend.dto;

import jakarta.validation.constraints.NotBlank;

public record AIRequest(
        @NotBlank(message = "message is required") String message,
        String context,
        Long materialId) {

    public String prompt() {
        return message;
    }
}
