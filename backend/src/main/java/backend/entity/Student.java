package backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "university_id", unique = true, nullable = false)
    private String universityId;


    @Column(nullable = false)
    private String name;


    @Column(unique = true, nullable = false)
    private String email;


    @Column(nullable = false)
    private String password;


    private String batch;


    private String department;


    private Integer year;

    @Column(length = 1000)
    private String bio;

    private String avatarInitials;

    @Column
    private String section = "Second Year A";


    @Column(name = "created_at")
    private LocalDateTime createdAt;


    public Student() {
    }


    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }


    public Long getId() {
        return id;
    }


    public String getUniversityId() {
        return universityId;
    }


    public void setUniversityId(String universityId) {
        this.universityId = universityId;
    }


    public String getName() {
        return name;
    }


    public void setName(String name) {
        this.name = name;
    }


    public String getEmail() {
        return email;
    }


    public void setEmail(String email) {
        this.email = email;
    }


    public String getPassword() {
        return password;
    }


    public void setPassword(String password) {
        this.password = password;
    }


    public String getBatch() {
        return batch;
    }


    public void setBatch(String batch) {
        this.batch = batch;
    }


    public String getDepartment() {
        return department;
    }


    public void setDepartment(String department) {
        this.department = department;
    }


    public Integer getYear() {
        return year;
    }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }


    public void setYear(Integer year) {
        this.year = year;
    }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getAvatarInitials() { return avatarInitials; }
    public void setAvatarInitials(String avatarInitials) { this.avatarInitials = avatarInitials; }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
