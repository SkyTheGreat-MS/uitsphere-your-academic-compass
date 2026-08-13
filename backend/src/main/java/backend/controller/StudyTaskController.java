package backend.controller;

import backend.dto.StudyTaskRequest;
import backend.dto.StudyTaskResponse;
import backend.service.StudyTaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/study-tasks")
public class StudyTaskController {

    private final StudyTaskService studyTaskService;

    public StudyTaskController(StudyTaskService studyTaskService) {
        this.studyTaskService = studyTaskService;
    }

    @GetMapping
    public List<StudyTaskResponse> list() {
        return studyTaskService.list();
    }

    @PostMapping
    public StudyTaskResponse create(@Valid @RequestBody StudyTaskRequest request) {
        return studyTaskService.create(request);
    }

    @PutMapping("/{id}")
    public StudyTaskResponse update(@PathVariable Long id, @Valid @RequestBody StudyTaskRequest request) {
        return studyTaskService.update(id, request);
    }

    @PutMapping("/{id}/toggle")
    public StudyTaskResponse toggleStatus(@PathVariable Long id) {
        return studyTaskService.toggleStatus(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studyTaskService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(ex.getMessage()));
    }

    public record ErrorResponse(String error) {
    }
}
