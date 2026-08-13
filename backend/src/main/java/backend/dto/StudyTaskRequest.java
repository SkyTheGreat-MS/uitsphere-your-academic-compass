package backend.dto;

import backend.entity.StudyTaskStatus;
import backend.entity.StudyTaskPriority;

public record StudyTaskRequest(
        String title,
        String description,
        String dueDate,
        String dueTime,
        StudyTaskPriority priority,
        StudyTaskStatus status) {
}
