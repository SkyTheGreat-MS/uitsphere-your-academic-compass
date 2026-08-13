package backend.dto;

import backend.entity.StudyTaskPriority;

public record RecommendationResponse(
        String id,
        String title,
        String detail,
        String type,
        int priority,
        Long targetId,
        String dueDate,
        String dueTime) {

    public static RecommendationResponse studentTask(StudyTaskResponse task, StudyTaskPriority priority) {
        int order = switch (priority) {
            case HIGH -> 5;
            case MEDIUM -> 6;
            default -> 7;
        };
        return new RecommendationResponse(
                "task-" + task.id(),
                task.title(),
                task.description() == null || task.description().isBlank() ? "Student task" : task.description(),
                "task",
                order,
                task.id(),
                task.dueDate(),
                task.dueTime());
    }
}
