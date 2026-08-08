package backend.repository;

import backend.entity.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {

    List<Flashcard> findByDeckIdOrderByOrderIndexAsc(Long deckId);

    long countByDeckId(Long deckId);
}