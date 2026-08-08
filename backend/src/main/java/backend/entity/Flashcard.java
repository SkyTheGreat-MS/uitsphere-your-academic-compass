package backend.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "flashcards")
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "deck_id", nullable = false)
    private FlashcardDeck deck;

    @Column(nullable = false, columnDefinition = "text")
    private String question;

    @Column(nullable = false, columnDefinition = "text")
    private String answer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FlashcardDifficulty difficulty;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @OneToMany(mappedBy = "flashcard", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FlashcardProgress> progress = new ArrayList<>();

    public Long getId() { return id; }
    public FlashcardDeck getDeck() { return deck; }
    public void setDeck(FlashcardDeck deck) { this.deck = deck; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public FlashcardDifficulty getDifficulty() { return difficulty; }
    public void setDifficulty(FlashcardDifficulty difficulty) { this.difficulty = difficulty; }
    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    public List<FlashcardProgress> getProgress() { return progress; }
    public void setProgress(List<FlashcardProgress> progress) {
        this.progress = progress == null ? new ArrayList<>() : new ArrayList<>(progress);
    }
}