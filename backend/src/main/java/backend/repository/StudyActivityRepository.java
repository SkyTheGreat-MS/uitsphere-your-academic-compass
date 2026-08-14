package backend.repository;

import backend.entity.Student;
import backend.entity.StudyActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StudyActivityRepository extends JpaRepository<StudyActivity, Long> {
    Optional<StudyActivity> findByStudentAndActivityDate(Student student, LocalDate activityDate);
    List<StudyActivity> findByStudentOrderByActivityDateDesc(Student student);
}
