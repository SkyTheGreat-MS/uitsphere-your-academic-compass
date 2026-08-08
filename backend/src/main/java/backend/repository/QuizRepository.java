package backend.repository;

import backend.entity.Quiz;
import backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByStudentOrderByUpdatedAtDesc(Student student);

    Optional<Quiz> findByIdAndStudent(Long id, Student student);
}