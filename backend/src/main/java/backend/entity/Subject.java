package backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String lecturer;

    public Subject() {}

    public Subject(String code, String name, String lecturer) {
        this.code = code;
        this.name = name;
        this.lecturer = lecturer;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getLecturer() { return lecturer; }
}
