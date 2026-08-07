package backend.service;

import backend.dto.LearningMaterialResponse;
import backend.entity.LearningMaterial;
import backend.entity.LearningMaterialFileType;
import backend.entity.LearningMaterialStatus;
import backend.entity.Student;
import backend.repository.LearningMaterialRepository;
import backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class LearningMaterialService {

    private final LearningMaterialRepository materialRepository;
    private final StudentRepository studentRepository;
    private final DocumentProcessingService documentProcessingService;
    private final Path storageRoot;

    public LearningMaterialService(
            LearningMaterialRepository materialRepository,
            StudentRepository studentRepository,
            DocumentProcessingService documentProcessingService,
            @Value("${file.upload-dir:uploads}") String storagePath) {
        this.materialRepository = materialRepository;
        this.studentRepository = studentRepository;
        this.documentProcessingService = documentProcessingService;
        this.storageRoot = Path.of(storagePath).toAbsolutePath().normalize();
    }

    public LearningMaterialResponse upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new LearningMaterialException("Please select a file to upload.");
        }

        String originalFileName = sanitizeOriginalFileName(file.getOriginalFilename());
        LearningMaterialFileType fileType = determineFileType(originalFileName);
        Student student = currentStudent();
        String storedFileName = UUID.randomUUID() + extensionOf(originalFileName);
        Path studentDirectory = storageRoot.resolve(student.getId().toString()).normalize();
        Path storedFile = studentDirectory.resolve(storedFileName).normalize();
        String relativeFilePath = student.getId() + "/" + storedFileName;

        if (!storedFile.startsWith(studentDirectory)) {
            throw new LearningMaterialException("Invalid file name.");
        }

        LearningMaterial material = new LearningMaterial();
        material.setStudent(student);
        material.setTitle(originalFileName);
        material.setFileName(storedFileName);
        material.setOriginalFileName(originalFileName);
        material.setFilePath(relativeFilePath);
        material.setFileType(fileType);
        material.setFileSize(file.getSize());
        material.setStatus(LearningMaterialStatus.UPLOADED);

        material = materialRepository.save(material);

        try {
            Files.createDirectories(studentDirectory);
            Files.copy(file.getInputStream(), storedFile);
            material.setStatus(LearningMaterialStatus.PROCESSING);
            materialRepository.save(material);

            DocumentProcessingService.ProcessingResult processingResult =
                    documentProcessingService.process(file, storedFile, fileType);
            material.setExtractedText(processingResult.extractedText());
            material.setStatus(processingResult.successful()
                    ? LearningMaterialStatus.READY
                    : LearningMaterialStatus.FAILED);
            return LearningMaterialResponse.from(materialRepository.save(material));
        } catch (LearningMaterialException ex) {
            material.setStatus(LearningMaterialStatus.FAILED);
            materialRepository.save(material);
            throw ex;
        } catch (IOException ex) {
            material.setStatus(LearningMaterialStatus.FAILED);
            materialRepository.save(material);
            throw new LearningMaterialException("Could not store the uploaded file.", ex);
        }
    }

    public List<LearningMaterialResponse> getMaterials() {
        Student student = currentStudent();
        return materialRepository.findByStudentOrderByCreatedAtDesc(student)
                .stream()
                .map(LearningMaterialResponse::from)
                .toList();
    }

    public void delete(Long id) {
        Student student = currentStudent();
        LearningMaterial material = materialRepository.findByIdAndStudent(id, student)
                .orElseThrow(() -> new LearningMaterialException("Learning material not found."));

        Path studentDirectory = storageRoot.resolve(student.getId().toString()).normalize();
        Path storedFile = studentDirectory.resolve(material.getFileName()).normalize();
        if (!storedFile.startsWith(studentDirectory)) {
            throw new LearningMaterialException("Invalid stored file path.");
        }

        try {
            Files.deleteIfExists(storedFile);
        } catch (IOException ex) {
            throw new LearningMaterialException("Could not delete the stored file.", ex);
        }
        materialRepository.delete(material);
    }

    private Student currentStudent() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new LearningMaterialException("Authenticated student not found."));
    }

    private String sanitizeOriginalFileName(String originalFileName) {
        if (originalFileName == null || originalFileName.isBlank()) {
            throw new LearningMaterialException("The uploaded file must have a name.");
        }
        String fileName = Path.of(originalFileName).getFileName().toString();
        if (fileName.isBlank() || fileName.equals(".") || fileName.equals("..")) {
            throw new LearningMaterialException("Invalid file name.");
        }
        return fileName;
    }

    private LearningMaterialFileType determineFileType(String fileName) {
        String extension = extensionOf(fileName).toLowerCase(Locale.ROOT);
        return switch (extension) {
            case ".pdf" -> LearningMaterialFileType.PDF;
            case ".ppt" -> LearningMaterialFileType.PPT;
            case ".pptx" -> LearningMaterialFileType.PPTX;
            case ".doc" -> LearningMaterialFileType.DOC;
            case ".docx" -> LearningMaterialFileType.DOCX;
            case ".jpg", ".jpeg", ".png", ".gif", ".webp" -> LearningMaterialFileType.IMAGE;
            default -> throw new LearningMaterialException(
                    "Unsupported file type. Upload a PDF, PPT, PPTX, DOC, DOCX, or image.");
        };
    }

    private String extensionOf(String fileName) {
        int extensionStart = fileName.lastIndexOf('.');
        return extensionStart >= 0 ? fileName.substring(extensionStart) : "";
    }
}
