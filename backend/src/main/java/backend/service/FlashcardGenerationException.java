package backend.service;

public class FlashcardGenerationException extends RuntimeException {

    public FlashcardGenerationException(String message) {
        super(message);
    }

    public FlashcardGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}