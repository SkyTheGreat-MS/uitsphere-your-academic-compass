package backend.service;

import backend.dto.SummaryGenerateRequest;
import backend.dto.SummaryResponse;
import backend.entity.Student;
import backend.entity.Summary;
import backend.repository.SummaryRepository;
import backend.repository.StudentRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SummaryService {

    private final SummaryRepository summaryRepository;
    private final StudentRepository studentRepository;
    private final AIContentGenerationService generationService;
    private final NotificationService notificationService;

    public SummaryService(
            SummaryRepository summaryRepository,
            StudentRepository studentRepository,
            AIContentGenerationService generationService,
            NotificationService notificationService) {
        this.summaryRepository = summaryRepository;
        this.studentRepository = studentRepository;
        this.generationService = generationService;
        this.notificationService = notificationService;
    }

    public SummaryResponse generate(SummaryGenerateRequest request) {
        Student student = currentStudent();
        List<Long> materialIds = request.materialIds().stream().distinct().toList();
        String content = generationService.generateSummary(materialIds);

        Summary summary = new Summary();
        summary.setStudent(student);
        summary.setTitle(materialIds.size() == 1 ? "Lecture summary" : "Combined lecture summary");
        summary.setContent(content);
        summary.setMaterialIds(materialIds);
        Summary saved = summaryRepository.save(summary);
        notificationService.notify(
                student,
                "summary",
                "Summary generated",
                "A summary for your lecture is ready to review.",
                "/studio");
        return SummaryResponse.from(saved);
    }

    public List<SummaryResponse> list() {
        return summaryRepository.findByStudentOrderByUpdatedAtDesc(currentStudent())
                .stream()
                .map(SummaryResponse::from)
                .toList();
    }

    public SummaryResponse get(Long id) {
        Student student = currentStudent();
        Summary summary = summaryRepository.findByIdAndStudent(id, student)
                .orElseThrow(() -> new LearningMaterialException("Summary not found."));
        return SummaryResponse.from(summary);
    }

    public void delete(Long id) {
        Student student = currentStudent();
        Summary summary = summaryRepository.findByIdAndStudent(id, student)
                .orElseThrow(() -> new LearningMaterialException("Summary not found."));
        summaryRepository.delete(summary);
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
