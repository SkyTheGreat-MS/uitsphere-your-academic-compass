package backend.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "flashcard_decks")
public class FlashcardDeck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String title;

    @ElementCollection
    @CollectionTable(name = "flashcard_deck_material_ids", joinColumns = @JoinColumn(name = "deck_id"))
    @OrderColumn(name = "material_order")
    @Column(name = "material_id", nullable = false)
    private List<Long> materialIds = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "deck", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Flashcard> flashcards = new ArrayList<>();

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public List<Long> getMaterialIds() { return materialIds; }
    public void setMaterialIds(List<Long> materialIds) {
        this.materialIds = materialIds == null ? new ArrayList<>() : new ArrayList<>(materialIds);
    }
    public List<Flashcard> getFlashcards() { return flashcards; }
    public void setFlashcards(List<Flashcard> flashcards) {
        this.flashcards = flashcards == null ? new ArrayList<>() : new ArrayList<>(flashcards);
    }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}