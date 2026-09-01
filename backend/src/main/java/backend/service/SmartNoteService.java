package backend.service;

import backend.dto.SmartNoteGenerateRequest;
import backend.dto.SmartNoteResponse;
import backend.entity.LearningMaterial;
import backend.entity.SmartNote;
import backend.entity.Student;
import backend.repository.LearningMaterialRepository;
import backend.repository.SmartNoteRepository;
import backend.repository.StudentRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SmartNoteService {
    private final SmartNoteRepository repository;
    private final StudentRepository studentRepository;
    private final LearningMaterialRepository materialRepository;
    private final AIContentGenerationService generationService;
    private final NotificationService notificationService;

    public SmartNoteService(SmartNoteRepository repository, StudentRepository studentRepository,
            LearningMaterialRepository materialRepository,
            AIContentGenerationService generationService, NotificationService notificationService) {
        this.repository = repository;
        this.studentRepository = studentRepository;
        this.materialRepository = materialRepository;
        this.generationService = generationService;
        this.notificationService = notificationService;
    }

    public SmartNoteResponse generate(SmartNoteGenerateRequest request) {
        Student student = currentStudent();
        List<Long> materialIds = request.materialIds().stream().distinct().toList();
        List<LearningMaterial> materials = materialRepository.findByIdInAndStudent(materialIds, student);
        String title = LectureTitleUtil.formatTitleFromMaterials(materialIds, materials, "Lecture smart notes");

        SmartNote note = new SmartNote();
        note.setStudent(student);
        note.setTitle(title);
        note.setContent(generationService.generateSmartNotes(materialIds));
        note.setMaterialIds(materialIds);
        SmartNoteResponse response = SmartNoteResponse.from(repository.save(note));
        notificationService.notify(
                student,
                "notes",
                "Smart notes generated",
                "\"" + title + "\" smart notes are ready to review.",
                "/studio");
        return response;
    }

    public List<SmartNoteResponse> list() {
        return repository.findByStudentOrderByUpdatedAtDesc(currentStudent()).stream().map(SmartNoteResponse::from).toList();
    }

    public SmartNoteResponse get(Long id) {
        Student student = currentStudent();
        SmartNote note = repository.findByIdAndStudent(id, student)
                .orElseThrow(() -> new LearningMaterialException("Smart note not found."));
        return SmartNoteResponse.from(note);
    }

    public void delete(Long id) {
        Student student = currentStudent();
        SmartNote note = repository.findByIdAndStudent(id, student)
                .orElseThrow(() -> new LearningMaterialException("Smart note not found."));
        repository.delete(note);
    }

    private Student currentStudent() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank() || "anonymousUser".equals(auth.getName())) {
            throw new LearningMaterialException("User is not authenticated.");
        }
        String email = auth.getName();
        return studentRepository.findByEmail(email).orElseThrow(() -> new LearningMaterialException("Authenticated student not found."));
    }
}
