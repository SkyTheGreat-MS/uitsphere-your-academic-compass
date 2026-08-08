package backend.repository;

import backend.entity.ChatSession;
import backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    List<ChatSession> findByStudentOrderByUpdatedAtDesc(Student student);

    Optional<ChatSession> findByIdAndStudent(Long id, Student student);
}
