package backend.dto;

import jakarta.validation.constraints.AssertTrue;

public record AIRequest(
        String message,
        String question,
        String context,
        Long materialId) {

    @AssertTrue(message = "message is required")
    public boolean hasMessage() {
        return (message != null && !message.isBlank()) || (question != null && !question.isBlank());
    }

    public String prompt() {
        return message != null && !message.isBlank() ? message : question;
    }
}
