package backend.repository;

import backend.entity.ChatMessage;
import backend.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySessionOrderByCreatedAtAscIdAsc(ChatSession session);
}
