package backend.service;

public class LearningMaterialException extends RuntimeException {

    public LearningMaterialException(String message) {
        super(message);
    }

    public LearningMaterialException(String message, Throwable cause) {
        super(message, cause);
    }
}
