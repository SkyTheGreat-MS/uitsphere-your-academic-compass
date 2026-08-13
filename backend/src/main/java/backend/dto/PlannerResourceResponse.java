package backend.dto;

public record PlannerResourceResponse(
        Long id,
        String title,
        String type,
        String updatedAt) {
}
