package backend.repository;

import backend.entity.LearningMaterial;
import backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LearningMaterialRepository extends JpaRepository<LearningMaterial, Long> {

    List<LearningMaterial> findByStudentOrderByCreatedAtDesc(Student student);

    Optional<LearningMaterial> findByIdAndStudent(Long id, Student student);
}
