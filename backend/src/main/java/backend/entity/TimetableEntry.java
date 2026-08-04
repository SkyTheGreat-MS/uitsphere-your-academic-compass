package backend.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "timetable_entries")
public class TimetableEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false)
    private String dayOfWeek;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private String room;

    @Column(nullable = false)
    private String classType;

    @Column(nullable = false)
    private String academicYear;

    @Column(nullable = false)
    private String semester;

    @Column(nullable = false)
    private String section;

    public TimetableEntry() {}

    public TimetableEntry(Subject subject, String dayOfWeek, String startTime, String endTime,
                          String room, String classType, String academicYear, String semester, String section) {
        this.subject = subject;
        this.dayOfWeek = dayOfWeek;
        this.startTime = LocalTime.parse(startTime);
        this.endTime = LocalTime.parse(endTime);
        this.room = room;
        this.classType = classType;
        this.academicYear = academicYear;
        this.semester = semester;
        this.section = section;
    }

    public Long getId() { return id; }
    public Subject getSubject() { return subject; }
    public String getDayOfWeek() { return dayOfWeek; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public String getRoom() { return room; }
    public String getClassType() { return classType; }
    public String getAcademicYear() { return academicYear; }
    public String getSemester() { return semester; }
    public String getSection() { return section; }
}
