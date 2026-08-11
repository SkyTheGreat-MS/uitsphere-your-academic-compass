package backend.repository;

import backend.entity.Flashcard;
import backend.entity.FlashcardProgress;
import backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface FlashcardProgressRepository extends JpaRepository<FlashcardProgress, Long> {

    Optional<FlashcardProgress> findByStudentAndFlashcard(Student student, Flashcard flashcard);

    List<FlashcardProgress> findAllByStudentAndFlashcardIn(Student student, Collection<Flashcard> flashcards);

    long countByStudentAndLearned(Student student, boolean learned);
}