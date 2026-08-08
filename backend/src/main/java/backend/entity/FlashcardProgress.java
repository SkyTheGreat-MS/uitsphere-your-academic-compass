package backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "flashcard_progress")
public class FlashcardProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "flashcard_id", nullable = false)
    private Flashcard flashcard;

    @Column(nullable = false)
    private boolean learned;

    @Column(name = "last_reviewed")
    private LocalDateTime lastReviewed;

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Flashcard getFlashcard() { return flashcard; }
    public void setFlashcard(Flashcard flashcard) { this.flashcard = flashcard; }
    public boolean isLearned() { return learned; }
    public void setLearned(boolean learned) { this.learned = learned; }
    public LocalDateTime getLastReviewed() { return lastReviewed; }
    public void setLastReviewed(LocalDateTime lastReviewed) { this.lastReviewed = lastReviewed; }
}