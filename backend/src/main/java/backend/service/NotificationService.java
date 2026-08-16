package backend.service;

import backend.dto.NotificationResponse;
import backend.entity.Notification;
import backend.entity.Student;
import backend.entity.StudyTask;
import backend.entity.StudyTaskStatus;
import backend.repository.NotificationRepository;
import backend.repository.StudentRepository;
import backend.repository.StudyTaskRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final StudentRepository studentRepository;
    private final StudyTaskRepository studyTaskRepository;

    public NotificationService(NotificationRepository notificationRepository, StudentRepository studentRepository,
            StudyTaskRepository studyTaskRepository) {
        this.notificationRepository = notificationRepository;
        this.studentRepository = studentRepository;
        this.studyTaskRepository = studyTaskRepository;
    }

    @Transactional
    public void notify(Student student, String type, String title, String message, String link) {
        if (student == null) return;
        Notification notification = new Notification();
        notification.setStudent(student);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLink(link);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Transactional
    public List<NotificationResponse> list() {
        backfillDueToday();
        return notificationRepository.findByStudentOrderByCreatedAtDesc(currentStudent())
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    private void backfillDueToday() {
        Student student = currentStudent();
        List<Notification> existing = notificationRepository.findByStudentOrderByCreatedAtDesc(student);
        List<StudyTask> dueToday = studyTaskRepository
                .findByStudentOrderByDueDateAscDueTimeAscCreatedAtDesc(student)
                .stream()
                .filter(task -> task.getStatus() == StudyTaskStatus.TODO)
                .filter(task -> task.getDueDate() != null && task.getDueDate().equals(LocalDate.now()))
                .toList();
        for (StudyTask task : dueToday) {
            String message = "\"" + task.getTitle() + "\" is due today.";
            boolean alreadyNotified = existing.stream()
                    .anyMatch(n -> "task".equals(n.getType()) && message.equals(n.getMessage()));
            if (!alreadyNotified) {
                Notification notification = new Notification();
                notification.setStudent(student);
                notification.setType("task");
                notification.setTitle("Study task due today");
                notification.setMessage(message);
                notification.setLink("/planner");
                notification.setRead(false);
                notification.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(notification);
            }
        }
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        return notificationRepository.countByStudentAndRead(currentStudent(), false);
    }

    @Transactional
    public NotificationResponse markRead(Long id) {
        Notification notification = notificationRepository.findByIdAndStudent(id, currentStudent())
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setRead(true);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllRead() {
        List<Notification> notifications = notificationRepository
                .findByStudentOrderByCreatedAtDesc(currentStudent());
        for (Notification notification : notifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void delete(Long id) {
        Notification notification = notificationRepository.findByIdAndStudent(id, currentStudent())
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notificationRepository.delete(notification);
    }

    private Student currentStudent() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated student not found."));
    }
}