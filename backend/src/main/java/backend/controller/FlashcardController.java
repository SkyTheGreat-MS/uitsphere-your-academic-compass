package backend.controller;

import backend.dto.FlashcardDeckDetailResponse;
import backend.dto.FlashcardDeckResponse;
import backend.dto.FlashcardGenerateRequest;
import backend.dto.FlashcardProgressRequest;
import backend.dto.FlashcardProgressResponse;
import backend.service.FlashcardGenerationException;
import backend.service.FlashcardService;
import backend.service.GroqServiceException;
import backend.service.LearningMaterialException;
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
@RequestMapping("/api/ai/flashcards")
public class FlashcardController {

    private final FlashcardService flashcardService;

    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @PostMapping("/generate")
    public FlashcardDeckDetailResponse generate(@Valid @RequestBody FlashcardGenerateRequest request) {
        return flashcardService.generate(request);
    }

    @GetMapping
    public List<FlashcardDeckResponse> list() {
        return flashcardService.list();
    }

    @GetMapping("/{deckId}")
    public FlashcardDeckDetailResponse getDeck(@PathVariable Long deckId) {
        return flashcardService.getDeck(deckId);
    }

    @DeleteMapping("/{deckId}")
    public ResponseEntity<Void> deleteDeck(@PathVariable Long deckId) {
        flashcardService.deleteDeck(deckId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/progress")
    public FlashcardProgressResponse markLearned(@Valid @RequestBody FlashcardProgressRequest request) {
        return flashcardService.markLearned(request.flashcardId(), request.learned());
    }

    @ExceptionHandler(LearningMaterialException.class)
    public ResponseEntity<ErrorResponse> handleMaterialError(LearningMaterialException ex) {
        HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler({ GroqServiceException.class, FlashcardGenerationException.class })
    public ResponseEntity<ErrorResponse> handleGenerationError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new ErrorResponse(ex.getMessage()));
    }

    public record ErrorResponse(String error) {
    }
}