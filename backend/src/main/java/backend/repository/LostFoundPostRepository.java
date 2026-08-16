package backend.repository;

import backend.entity.LostFoundPost;
import backend.entity.LostFoundStatus;
import backend.entity.LostFoundType;
import backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LostFoundPostRepository extends JpaRepository<LostFoundPost, Long> {

    List<LostFoundPost> findAllByOrderByCreatedAtDesc();

    List<LostFoundPost> findByTypeOrderByCreatedAtDesc(LostFoundType type);

    List<LostFoundPost> findByReporterOrderByCreatedAtDesc(Student reporter);

    List<LostFoundPost> findByTypeAndStatusOrderByCreatedAtDesc(LostFoundType type, LostFoundStatus status);

    Optional<LostFoundPost> findByIdAndReporter(Long id, Student reporter);
}