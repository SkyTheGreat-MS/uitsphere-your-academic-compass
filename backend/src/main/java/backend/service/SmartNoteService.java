package backend.service;

import backend.dto.SmartNoteGenerateRequest;
import backend.dto.SmartNoteResponse;
import backend.entity.SmartNote;
import backend.entity.Student;
import backend.repository.SmartNoteRepository;
import backend.repository.StudentRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SmartNoteService {
    private final SmartNoteRepository repository;
    private final StudentRepository studentRepository;
    private final AIContentGenerationService generationService;

    public SmartNoteService(SmartNoteRepository repository, StudentRepository studentRepository, AIContentGenerationService generationService) {
        this.repository = repository;
        this.studentRepository = studentRepository;
        this.generationService = generationService;
    }

    public SmartNoteResponse generate(SmartNoteGenerateRequest request) {
        List<Long> materialIds = request.materialIds().stream().distinct().toList();
        SmartNote note = new SmartNote();
        note.setStudent(currentStudent());
        note.setTitle(materialIds.size() == 1 ? "Lecture smart notes" : "Combined lecture smart notes");
        note.setContent(generationService.generateSmartNotes(materialIds));
        note.setMaterialIds(materialIds);
        return SmartNoteResponse.from(repository.save(note));
    }

    public List<SmartNoteResponse> list() {
        return repository.findByStudentOrderByUpdatedAtDesc(currentStudent()).stream().map(SmartNoteResponse::from).toList();
    }

    private Student currentStudent() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByEmail(email).orElseThrow(() -> new LearningMaterialException("Authenticated student not found."));
    }
}
