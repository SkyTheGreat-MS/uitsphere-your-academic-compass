package backend.service;

import backend.entity.LearningMaterial;
import backend.entity.LearningMaterialStatus;
import backend.entity.Student;
import backend.repository.LearningMaterialRepository;
import backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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

        return validatedText(material);
    }

    public String getMaterialContext(List<Long> materialIds) {
        if (materialIds == null || materialIds.isEmpty()) return null;
        Student student = currentStudent();
        List<LearningMaterial> materials = materialRepository.findByIdInAndStudent(materialIds, student);
        if (materials.size() != materialIds.stream().distinct().count()) {
            throw new LearningMaterialException("One or more learning materials were not found.");
        }
        return materials.stream()
                .map(this::validatedText)
                .collect(Collectors.joining("\n\n--- Next lecture ---\n\n"));
    }

    private String validatedText(LearningMaterial material) {
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
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank() || "anonymousUser".equals(auth.getName())) {
            throw new LearningMaterialException("User is not authenticated.");
        }
        String email = auth.getName();
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new LearningMaterialException("Authenticated student not found."));
    }
}
