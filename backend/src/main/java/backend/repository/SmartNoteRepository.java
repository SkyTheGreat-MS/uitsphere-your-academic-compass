package backend.repository;

import backend.entity.SmartNote;
import backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SmartNoteRepository extends JpaRepository<SmartNote, Long> {
    List<SmartNote> findByStudentOrderByUpdatedAtDesc(Student student);
    Optional<SmartNote> findByIdAndStudent(Long id, Student student);
}
