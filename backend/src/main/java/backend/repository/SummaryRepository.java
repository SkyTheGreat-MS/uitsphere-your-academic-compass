package backend.repository;

import backend.entity.Student;
import backend.entity.Summary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SummaryRepository extends JpaRepository<Summary, Long> {

    List<Summary> findByStudentOrderByUpdatedAtDesc(Student student);
}
