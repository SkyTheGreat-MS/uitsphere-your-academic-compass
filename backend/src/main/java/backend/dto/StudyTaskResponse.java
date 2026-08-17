package backend.dto;

import backend.entity.StudyTask;

public record StudyTaskResponse(
        Long id,
        String title,
        String description,
        String dueDate,
        String dueTime,
        String priority,
        String status,
        String createdAt,
        String updatedAt) {

    public static StudyTaskResponse from(StudyTask task) {
        return new StudyTaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate() == null ? null : task.getDueDate().toString(),
                task.getDueTime() == null ? null : task.getDueTime().toString(),
                task.getPriority().name().toLowerCase(),
                task.getStatus().name().toLowerCase(),
                task.getCreatedAt().toString(),
                task.getUpdatedAt().toString());
    }
}
