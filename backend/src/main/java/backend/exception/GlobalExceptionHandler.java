package backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
                .body(Map.of("body", "Request body is not valid JSON for this endpoint."));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUploadSizeExceeded(
            MaxUploadSizeExceededException ex) {
        Map<String, String> error = Map.of(
                "message", "File too large. Maximum upload size is 50MB.");

        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(error);
    }

}
