package backend.service;

import backend.dto.ChatMessageRequest;
import backend.dto.ChatMessageResponse;
import backend.dto.ChatSessionResponse;
import backend.dto.CreateChatSessionRequest;
import backend.entity.ChatMessage;
import backend.entity.ChatMessageRole;
import backend.entity.ChatSession;
import backend.entity.LearningMaterial;
import backend.entity.Student;
import backend.exception.ChatException;
import backend.repository.ChatMessageRepository;
import backend.repository.ChatSessionRepository;
import backend.repository.LearningMaterialRepository;
import backend.repository.StudentRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final LearningMaterialRepository materialRepository;
    private final StudentRepository studentRepository;
    private final MaterialContextService materialContextService;
    private final GroqService groqService;
    private final StudyStreakService studyStreakService;

    public ChatService(
            ChatSessionRepository sessionRepository,
            ChatMessageRepository messageRepository,
            LearningMaterialRepository materialRepository,
            StudentRepository studentRepository,
            MaterialContextService materialContextService,
            GroqService groqService,
            StudyStreakService studyStreakService) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.materialRepository = materialRepository;
        this.studentRepository = studentRepository;
        this.materialContextService = materialContextService;
        this.groqService = groqService;
        this.studyStreakService = studyStreakService;
    }

    public ChatSessionResponse createSession(CreateChatSessionRequest request) {
        Student student = currentStudent();
        List<Long> requestedIds = request == null ? List.of() : requestedMaterialIds(request);
        List<LearningMaterial> materials = requestedIds.isEmpty()
                ? List.of()
                : materialRepository.findByIdInAndStudent(requestedIds, student);
        if (materials.size() != requestedIds.stream().distinct().count()) {
            throw new ChatException("One or more learning materials were not found.");
        }

        ChatSession session = new ChatSession();
        session.setStudent(student);
        session.setLearningMaterials(materials);
        session.setLearningMaterial(materials.isEmpty() ? null : materials.get(0));
        String requestedTitle = request == null ? null : request.title();
        session.setTitle(requestedTitle == null || requestedTitle.isBlank()
                ? materials.isEmpty() ? "New conversation" : materials.get(0).getTitle()
                : requestedTitle.strip());
        return ChatSessionResponse.from(sessionRepository.save(session));
    }

    public List<ChatSessionResponse> listSessions() {
        return sessionRepository.findByStudentOrderByUpdatedAtDesc(currentStudent())
                .stream()
                .map(ChatSessionResponse::from)
                .toList();
    }

    public List<ChatMessageResponse> listMessages(Long sessionId) {
        ChatSession session = ownedSession(sessionId);
        return messageRepository.findBySessionOrderByCreatedAtAscIdAsc(session)
                .stream()
                .map(ChatMessageResponse::from)
                .toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest request) {
        ChatSession session = ownedSession(request.sessionId());
        if (request.materialIds() != null) {
            updateSessionMaterials(session, request.materialIds());
        }
        String question = request.message().strip();
        if (question.isEmpty()) {
            throw new ChatException("Message cannot be empty.");
        }

        ChatMessage userMessage = new ChatMessage();
        userMessage.setSession(session);
        userMessage.setRole(ChatMessageRole.USER);
        userMessage.setContent(question);
        messageRepository.save(userMessage);

        session.touch();
        sessionRepository.save(session);

        String lectureContext = session.getLearningMaterials().isEmpty()
                ? session.getLearningMaterial() == null ? null
                : materialContextService.getMaterialContext(session.getLearningMaterial().getId())
                : materialContextService.getMaterialContext(
                        session.getLearningMaterials().stream().map(LearningMaterial::getId).toList());
        String conversationContext = conversationContext(session);
        String context = combineContext(lectureContext, conversationContext);
        String answer = groqService.ask(question, context);

        ChatMessage assistantMessage = new ChatMessage();
        assistantMessage.setSession(session);
        assistantMessage.setRole(ChatMessageRole.ASSISTANT);
        assistantMessage.setContent(answer);
        ChatMessage savedAssistant = messageRepository.save(assistantMessage);

        session.touch();
        sessionRepository.save(session);
        studyStreakService.record(session.getStudent(), backend.entity.StudyActivityType.AI_TUTOR);
        return ChatMessageResponse.from(savedAssistant);
    }

    private List<Long> requestedMaterialIds(CreateChatSessionRequest request) {
        if (request.materialIds() != null && !request.materialIds().isEmpty()) {
            return request.materialIds().stream().distinct().toList();
        }
        return request.materialId() == null ? List.of() : List.of(request.materialId());
    }

    private void updateSessionMaterials(ChatSession session, List<Long> materialIds) {
        List<Long> requestedIds = materialIds.stream().distinct().toList();
        List<LearningMaterial> materials = requestedIds.isEmpty()
                ? List.of()
                : materialRepository.findByIdInAndStudent(requestedIds, currentStudent());
        if (materials.size() != requestedIds.size()) {
            throw new ChatException("One or more learning materials were not found.");
        }
        session.setLearningMaterials(materials);
        session.setLearningMaterial(materials.isEmpty() ? null : materials.get(0));
        session.touch();
        sessionRepository.save(session);
    }

    private String conversationContext(ChatSession session) {
        List<ChatMessage> messages = messageRepository.findBySessionOrderByCreatedAtAscIdAsc(session);
        if (!messages.isEmpty()) {
            messages = messages.subList(0, messages.size() - 1);
        }
        if (messages.isEmpty()) return null;

        StringBuilder history = new StringBuilder("Conversation history:\n");
        for (ChatMessage message : messages) {
            history.append(message.getRole().name()).append(": ")
                    .append(message.getContent()).append("\n");
        }
        return history.toString().strip();
    }

    private String combineContext(String lectureContext, String conversationContext) {
        if (lectureContext == null || lectureContext.isBlank()) return conversationContext;
        if (conversationContext == null || conversationContext.isBlank()) return lectureContext;
        return "Lecture context:\n" + lectureContext + "\n\n" + conversationContext;
    }

    private ChatSession ownedSession(Long sessionId) {
        return sessionRepository.findByIdAndStudent(sessionId, currentStudent())
                .orElseThrow(() -> new ChatException("Chat session not found."));
    }

    private Student currentStudent() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new ChatException("Authenticated student not found."));
    }
}
