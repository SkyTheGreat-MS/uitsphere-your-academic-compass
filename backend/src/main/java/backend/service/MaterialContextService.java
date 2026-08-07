package backend.service;

import backend.entity.LearningMaterial;
import backend.entity.LearningMaterialStatus;
import backend.entity.Student;
import backend.repository.LearningMaterialRepository;
import backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class MaterialContextService {

    private final LearningMaterialRepository materialRepository;
    private final StudentRepository studentRepository;
    private final int maximumContextCharacters;

    public MaterialContextService(
            LearningMaterialRepository materialRepository,
            StudentRepository studentRepository,
            @Value("${ai.material-context.max-characters:12000}") int maximumContextCharacters) {
        this.materialRepository = materialRepository;
        this.studentRepository = studentRepository;
        this.maximumContextCharacters = maximumContextCharacters;
    }

    public String getMaterialContext(Long materialId) {
        Student student = currentStudent();
        LearningMaterial material = materialRepository.findByIdAndStudent(materialId, student)
                .orElseThrow(() -> new LearningMaterialException("Learning material not found."));

        if (material.getStatus() == LearningMaterialStatus.PROCESSING) {
            throw new LearningMaterialException("Learning material is still being processed.");
        }
        if (material.getStatus() == LearningMaterialStatus.FAILED) {
            throw new LearningMaterialException("Learning material text extraction failed.");
        }

        String extractedText = material.getExtractedText();
        if (extractedText == null || extractedText.isBlank()) {
            throw new LearningMaterialException("Learning material has no extracted text.");
        }

        String normalizedText = extractedText.strip();
        if (normalizedText.length() <= maximumContextCharacters) {
            return normalizedText;
        }

        int safeEnd = maximumContextCharacters;
        if (safeEnd > 0 && Character.isHighSurrogate(normalizedText.charAt(safeEnd - 1))) {
            safeEnd--;
        }
        return normalizedText.substring(0, safeEnd).strip()
                + "\n\n[Lecture context truncated.]";
    }

    private Student currentStudent() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new LearningMaterialException("Authenticated student not found."));
    }
}
