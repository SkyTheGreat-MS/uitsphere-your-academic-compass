package backend.dto;

import backend.entity.Summary;

import java.util.List;

public record SummaryResponse(
        Long id,
        Long studentId,
        String title,
        String content,
        List<Long> materialIds,
        String createdAt,
        String updatedAt) {

    public static SummaryResponse from(Summary summary) {
        return new SummaryResponse(
                summary.getId(),
                summary.getStudent().getId(),
                summary.getTitle(),
                summary.getContent(),
                summary.getMaterialIds(),
                summary.getCreatedAt().toString(),
                summary.getUpdatedAt().toString());
    }
}
