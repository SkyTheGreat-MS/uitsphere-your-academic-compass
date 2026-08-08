package backend.repository;

import backend.entity.QuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, Long> {

    List<QuizAnswer> findByAttemptId(Long attemptId);

    List<QuizAnswer> findByAttemptIdOrderByIdAsc(Long attemptId);

    Optional<QuizAnswer> findOneByAttemptIdAndQuestionId(Long attemptId, Long questionId);
}