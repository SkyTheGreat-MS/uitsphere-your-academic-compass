package backend.service;

import backend.dto.StudyTaskRequest;
import backend.dto.StudyTaskResponse;
import backend.entity.Student;
import backend.entity.StudyTask;
import backend.entity.StudyTaskPriority;
import backend.entity.StudyTaskStatus;
import backend.repository.StudentRepository;
import backend.repository.StudyTaskRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class StudyTaskService {

    private final StudyTaskRepository studyTaskRepository;
    private final StudentRepository studentRepository;
    private final StudyStreakService studyStreakService;
    private final NotificationService notificationService;

    public StudyTaskService(StudyTaskRepository studyTaskRepository, StudentRepository studentRepository,
            StudyStreakService studyStreakService, NotificationService notificationService) {
        this.studyTaskRepository = studyTaskRepository;
        this.studentRepository = studentRepository;
        this.studyStreakService = studyStreakService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<StudyTaskResponse> list() {
        return studyTaskRepository.findByStudentOrderByDueDateAscDueTimeAscCreatedAtDesc(currentStudent())
                .stream()
                .map(StudyTaskResponse::from)
                .toList();
    }

    @Transactional
    public StudyTaskResponse create(StudyTaskRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Task title is required.");
        }
        StudyTask task = new StudyTask();
        task.setStudent(currentStudent());
        apply(task, request);
        StudyTask saved = studyTaskRepository.save(task);
        if (saved.getStatus() == StudyTaskStatus.COMPLETED) {
            studyStreakService.record(saved.getStudent(), backend.entity.StudyActivityType.TASK_COMPLETED);
        }
        notifyIfDueToday(saved);
        return StudyTaskResponse.from(saved);
    }

    @Transactional
    public StudyTaskResponse update(Long id, StudyTaskRequest request) {
        StudyTask task = studyTaskRepository.findByIdAndStudent(id, currentStudent())
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        apply(task, request);
        StudyTask saved = studyTaskRepository.save(task);
        if (saved.getStatus() == StudyTaskStatus.COMPLETED) {
            studyStreakService.record(saved.getStudent(), backend.entity.StudyActivityType.TASK_COMPLETED);
        }
        notifyIfDueToday(saved);
        return StudyTaskResponse.from(saved);
    }

    @Transactional
    public StudyTaskResponse toggleStatus(Long id) {
        StudyTask task = studyTaskRepository.findByIdAndStudent(id, currentStudent())
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        task.setStatus(task.getStatus() == StudyTaskStatus.COMPLETED ? StudyTaskStatus.TODO : StudyTaskStatus.COMPLETED);
        StudyTask saved = studyTaskRepository.save(task);
        if (saved.getStatus() == StudyTaskStatus.COMPLETED) {
            studyStreakService.record(saved.getStudent(), backend.entity.StudyActivityType.TASK_COMPLETED);
        }
        return StudyTaskResponse.from(saved);
    }

    @Transactional
    public void delete(Long id) {
        StudyTask task = studyTaskRepository.findByIdAndStudent(id, currentStudent())
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        studyTaskRepository.delete(task);
    }

    private void apply(StudyTask task, StudyTaskRequest request) {
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setDueDate(parseDate(request.dueDate()));
        task.setDueTime(parseTime(request.dueTime()));
        task.setPriority(request.priority() == null ? StudyTaskPriority.MEDIUM : request.priority());
        task.setStatus(request.status() == null ? StudyTaskStatus.TODO : request.status());
    }

    private static LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private static LocalTime parseTime(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalTime.parse(value.trim());
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private void notifyIfDueToday(StudyTask task) {
        if (task.getStatus() != StudyTaskStatus.TODO) return;
        if (task.getDueDate() == null || !task.getDueDate().equals(LocalDate.now())) return;
        notificationService.notify(
                task.getStudent(),
                "task",
                "Study task due today",
                "\"" + task.getTitle() + "\" is due today.",
                "/planner");
    }

    private Student currentStudent() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated student not found."));
    }
}
