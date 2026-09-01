package backend.controller;

import backend.dto.SmartNoteGenerateRequest;
import backend.dto.SmartNoteResponse;
import backend.service.GroqServiceException;
import backend.service.LearningMaterialException;
import backend.service.SmartNoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ai/notes")
public class SmartNoteController {
    private final SmartNoteService service;
    public SmartNoteController(SmartNoteService service) { this.service = service; }
    @PostMapping("/generate") public SmartNoteResponse generate(@Valid @RequestBody SmartNoteGenerateRequest request) { return service.generate(request); }
    @GetMapping public List<SmartNoteResponse> list() { return service.list(); }
    @GetMapping("/{id}") public SmartNoteResponse get(@PathVariable Long id) { return service.get(id); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
    @ExceptionHandler(LearningMaterialException.class)
    public ResponseEntity<ErrorResponse> materialError(LearningMaterialException ex) {
        HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(new ErrorResponse(ex.getMessage()));
    }
    @ExceptionHandler(GroqServiceException.class) public ResponseEntity<ErrorResponse> groqError(GroqServiceException ex) { return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new ErrorResponse(ex.getMessage())); }
    public record ErrorResponse(String error) { }
}
