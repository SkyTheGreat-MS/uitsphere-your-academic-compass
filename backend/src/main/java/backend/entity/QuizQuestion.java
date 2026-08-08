package backend.entity;

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
import jakarta.persistence.Table;

@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false, columnDefinition = "text")
    private String question;

    @Column(name = "option_a", nullable = false, columnDefinition = "text")
    private String optionA;

    @Column(name = "option_b", nullable = false, columnDefinition = "text")
    private String optionB;

    @Column(name = "option_c", nullable = false, columnDefinition = "text")
    private String optionC;

    @Column(name = "option_d", nullable = false, columnDefinition = "text")
    private String optionD;

    @Enumerated(EnumType.STRING)
    @Column(name = "correct_option", nullable = false)
    private QuizCorrectOption correctOption;

    @Column(nullable = false, columnDefinition = "text")
    private String explanation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuizDifficulty difficulty;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    public Long getId() { return id; }
    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public String getOptionA() { return optionA; }
    public void setOptionA(String optionA) { this.optionA = optionA; }
    public String getOptionB() { return optionB; }
    public void setOptionB(String optionB) { this.optionB = optionB; }
    public String getOptionC() { return optionC; }
    public void setOptionC(String optionC) { this.optionC = optionC; }
    public String getOptionD() { return optionD; }
    public void setOptionD(String optionD) { this.optionD = optionD; }
    public QuizCorrectOption getCorrectOption() { return correctOption; }
    public void setCorrectOption(QuizCorrectOption correctOption) { this.correctOption = correctOption; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public QuizDifficulty getDifficulty() { return difficulty; }
    public void setDifficulty(QuizDifficulty difficulty) { this.difficulty = difficulty; }
    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
}