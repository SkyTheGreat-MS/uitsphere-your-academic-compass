package backend.controller;

import backend.dto.SummaryGenerateRequest;
import backend.dto.SummaryResponse;
import backend.service.GroqServiceException;
import backend.service.LearningMaterialException;
import backend.service.SummaryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/ai/summary")
public class SummaryController {

    private final SummaryService summaryService;

    public SummaryController(SummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @PostMapping("/generate")
    public SummaryResponse generate(@Valid @RequestBody SummaryGenerateRequest request) {
        return summaryService.generate(request);
    }

    @GetMapping
    public List<SummaryResponse> list() {
        return summaryService.list();
    }

    @GetMapping("/{id}")
    public SummaryResponse get(@PathVariable Long id) {
        return summaryService.get(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        summaryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(LearningMaterialException.class)
    public ResponseEntity<ErrorResponse> handleMaterialError(LearningMaterialException ex) {
        HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(GroqServiceException.class)
    public ResponseEntity<ErrorResponse> handleGroqError(GroqServiceException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new ErrorResponse(ex.getMessage()));
    }

    public record ErrorResponse(String error) { }
}
