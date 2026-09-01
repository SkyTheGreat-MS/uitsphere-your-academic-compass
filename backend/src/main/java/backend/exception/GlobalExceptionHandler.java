package backend.exception;

import backend.service.FlashcardGenerationException;
import backend.service.GroqServiceException;
import backend.service.LearningMaterialException;
import backend.service.QuizGenerationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                    errors.put(
                        error.getField(),
                        error.getDefaultMessage()
                    )
                );

        ex.getBindingResult().getFieldErrors().forEach(error ->
                log.warn("Request validation failed: field={}, rejectedValue={}, message={}",
                        error.getField(), error.getRejectedValue(), error.getDefaultMessage()));
        ex.getBindingResult().getGlobalErrors().forEach(error ->
                log.warn("Request validation failed: object={}, message={}",
                        error.getObjectName(), error.getDefaultMessage()));

        return new ResponseEntity<>(
                errors,
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleUnreadableMessage(
            HttpMessageNotReadableException ex) {
        log.warn("Request body could not be mapped to the target DTO", ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Request body is not valid JSON for this endpoint."));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUploadSizeExceeded(
            MaxUploadSizeExceededException ex) {
        Map<String, String> error = Map.of(
                "message", "File too large. Maximum upload size is 50MB.");

        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(LearningMaterialException.class)
    public ResponseEntity<Map<String, String>> handleLearningMaterial(LearningMaterialException ex) {
        log.warn("Learning material error: {}", ex.getMessage());
        HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(Map.of("message", ex.getMessage(), "error", ex.getMessage()));
    }

    @ExceptionHandler(ChatException.class)
    public ResponseEntity<Map<String, String>> handleChatException(ChatException ex) {
        log.warn("Chat error: {}", ex.getMessage());
        HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(Map.of("message", ex.getMessage(), "error", ex.getMessage()));
    }

    @ExceptionHandler({GroqServiceException.class, QuizGenerationException.class, FlashcardGenerationException.class})
    public ResponseEntity<Map<String, String>> handleAIServiceException(RuntimeException ex) {
        log.error("AI service error: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("message", ex.getMessage(), "error", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        log.error("Unhandled server exception: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "An unexpected error occurred. Please try again later."));
    }
}
