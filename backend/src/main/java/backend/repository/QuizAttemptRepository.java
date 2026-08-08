package backend.repository;

import backend.entity.QuizAttempt;
import backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByQuizIdAndStudentOrderByStartedAtDesc(Long quizId, Student student);

    Optional<QuizAttempt> findByIdAndStudent(Long id, Student student);

    Optional<QuizAttempt> findByIdAndQuizIdAndStudent(Long id, Long quizId, Student student);
}