package backend.repository;

import backend.entity.Notification;
import backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByStudentOrderByCreatedAtDesc(Student student);

    Optional<Notification> findByIdAndStudent(Long id, Student student);

    long countByStudentAndRead(Student student, boolean read);
}