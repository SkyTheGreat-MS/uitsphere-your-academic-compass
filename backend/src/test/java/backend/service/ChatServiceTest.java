package backend.service;

import backend.dto.ChatMessageRequest;
import backend.entity.ChatMessage;
import backend.entity.ChatMessageRole;
import backend.entity.ChatSession;
import backend.entity.Student;
import backend.repository.ChatMessageRepository;
import backend.repository.ChatSessionRepository;
import backend.repository.LearningMaterialRepository;
import backend.repository.StudentRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatSessionRepository sessionRepository;

    @Mock
    private ChatMessageRepository messageRepository;

    @Mock
    private LearningMaterialRepository materialRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private MaterialContextService materialContextService;

    @Mock
    private GroqService groqService;

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void sendsConversationHistoryToGroqAndSavesAssistantMessage() {
        Student student = new Student();
        ChatSession session = new ChatSession();
        session.setStudent(student);

        ChatMessage previous = new ChatMessage();
        previous.setSession(session);
        previous.setRole(ChatMessageRole.USER);
        previous.setContent("What is dependency injection?");

        ChatMessage current = new ChatMessage();
        current.setSession(session);
        current.setRole(ChatMessageRole.USER);
        current.setContent("Why is it useful?");

        ChatMessage assistant = mock(ChatMessage.class);
        when(assistant.getRole()).thenReturn(ChatMessageRole.ASSISTANT);
        when(assistant.getContent()).thenReturn("It reduces coupling.");
        when(assistant.getCreatedAt()).thenReturn(java.time.LocalDateTime.now());
        when(studentRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));
        when(sessionRepository.findByIdAndStudent(any(), eq(student))).thenReturn(Optional.of(session));
        when(messageRepository.findBySessionOrderByCreatedAtAscIdAsc(session))
                .thenReturn(List.of(previous, current));
        when(messageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> {
            ChatMessage message = invocation.getArgument(0);
            return message.getRole() == ChatMessageRole.ASSISTANT ? assistant : message;
        });
        when(groqService.ask(eq("Why is it useful?"), contains("What is dependency injection?")))
                .thenReturn("It reduces coupling.");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("student@example.com", null));

        ChatService service = new ChatService(
                sessionRepository,
                messageRepository,
                materialRepository,
                studentRepository,
                materialContextService,
                groqService);

        var response = service.sendMessage(new ChatMessageRequest(1L, "Why is it useful?", null));

        assertThat(response.role()).isEqualTo("ASSISTANT");
        assertThat(response.content()).isEqualTo("It reduces coupling.");
        verify(groqService).ask(eq("Why is it useful?"), contains("What is dependency injection?"));
        verify(messageRepository, times(2)).save(any(ChatMessage.class));
    }
}
