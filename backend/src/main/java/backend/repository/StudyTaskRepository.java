package backend.repository;

import backend.entity.Student;
import backend.entity.StudyTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudyTaskRepository extends JpaRepository<StudyTask, Long> {

    List<StudyTask> findByStudentOrderByDueDateAscDueTimeAscCreatedAtDesc(Student student);

    Optional<StudyTask> findByIdAndStudent(Long id, Student student);
}
