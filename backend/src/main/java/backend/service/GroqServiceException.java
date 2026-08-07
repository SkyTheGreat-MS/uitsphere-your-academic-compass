package backend.service;

public class GroqServiceException extends RuntimeException {

    public GroqServiceException(String message) {
        super(message);
    }

    public GroqServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
