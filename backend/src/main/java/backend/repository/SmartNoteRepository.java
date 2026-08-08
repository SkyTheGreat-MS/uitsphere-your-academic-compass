package backend.repository;

import backend.entity.SmartNote;
import backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SmartNoteRepository extends JpaRepository<SmartNote, Long> {
    List<SmartNote> findByStudentOrderByUpdatedAtDesc(Student student);
}
