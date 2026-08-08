package backend.repository;

import backend.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

    List<QuizQuestion> findByQuizIdOrderByOrderIndexAsc(Long quizId);

    long countByQuizId(Long quizId);
}