package backend.controller;

import backend.dto.ChatMessageRequest;
import backend.dto.ChatMessageResponse;
import backend.dto.ChatSessionResponse;
import backend.dto.CreateChatSessionRequest;
import backend.exception.ChatException;
import backend.service.ChatService;
import backend.service.GroqServiceException;
import backend.service.LearningMaterialException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/sessions")
    public ChatSessionResponse createSession(
            @RequestBody(required = false) CreateChatSessionRequest request) {
        return chatService.createSession(request);
    }

    @GetMapping("/sessions")
    public List<ChatSessionResponse> listSessions() {
        return chatService.listSessions();
    }

    @GetMapping("/sessions/{id}")
    public ChatSessionResponse getSession(@PathVariable Long id) {
        return chatService.getSession(id);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        chatService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sessions/{id}/messages")
    public List<ChatMessageResponse> listMessages(@PathVariable Long id) {
        return chatService.listMessages(id);
    }

    @PostMapping("/message")
    public ChatMessageResponse sendMessage(@Valid @RequestBody ChatMessageRequest request) {
        return chatService.sendMessage(request);
    }

    @ExceptionHandler(ChatException.class)
    public ResponseEntity<ErrorResponse> handleChatError(ChatException ex) {
        HttpStatus status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(new ErrorResponse(ex.getMessage()));
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
