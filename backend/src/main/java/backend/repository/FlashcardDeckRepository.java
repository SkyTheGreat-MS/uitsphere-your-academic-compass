package backend.repository;

import backend.entity.FlashcardDeck;
import backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FlashcardDeckRepository extends JpaRepository<FlashcardDeck, Long> {

    List<FlashcardDeck> findByStudentOrderByUpdatedAtDesc(Student student);

    Optional<FlashcardDeck> findByIdAndStudent(Long id, Student student);
}