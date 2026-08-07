package backend.controller;

import backend.dto.AIRequest;
import backend.dto.AIResponse;
import backend.service.GroqService;
import backend.service.GroqServiceException;
import backend.service.MaterialContextService;
import backend.service.LearningMaterialException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai")
public class AIController {

    private final GroqService groqService;
    private final MaterialContextService materialContextService;

    public AIController(GroqService groqService, MaterialContextService materialContextService) {
        this.groqService = groqService;
        this.materialContextService = materialContextService;
    }

    @PostMapping("/chat")
    public AIResponse chat(@Valid @RequestBody AIRequest request) {
        System.out.println("AI question: " + request.prompt());
        System.out.println("AI material ID: " + request.materialId());
        String context = request.materialId() == null
                ? request.context()
                : materialContextService.getMaterialContext(request.materialId());
        System.out.println("AI context length: " + (context == null ? 0 : context.length()));
        if (context != null && !context.isBlank()) {
            int previewLength = Math.min(200, context.length());
            System.out.println("AI context preview: \"" + context.substring(0, previewLength) + "\"");
        }
        String answer = groqService.ask(request.prompt(), context);
        return new AIResponse(answer, answer);
    }

    @ExceptionHandler(GroqServiceException.class)
    public ResponseEntity<ErrorResponse> handleGroqServiceError(GroqServiceException ex) {
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(LearningMaterialException.class)
    public ResponseEntity<ErrorResponse> handleMaterialContextError(LearningMaterialException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(ex.getMessage()));
    }

    public record ErrorResponse(String error) {
    }
}
