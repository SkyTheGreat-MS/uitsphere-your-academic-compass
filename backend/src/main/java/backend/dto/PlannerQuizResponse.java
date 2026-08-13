package backend.dto;

public record PlannerQuizResponse(
        Long id,
        String title,
        Integer completedAttempts,
        Integer bestScorePercent,
        boolean completed) {
}
