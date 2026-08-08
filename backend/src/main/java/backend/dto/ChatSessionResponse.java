package backend.dto;

import backend.entity.ChatSession;

import java.util.List;

public record ChatSessionResponse(
        Long id,
        List<Long> materialIds,
        Long materialId,
        String materialTitle,
        String title,
        String createdAt,
        String updatedAt) {

    public static ChatSessionResponse from(ChatSession session) {
        List<Long> materialIds = session.getLearningMaterials().stream()
                .map(material -> material.getId())
                .toList();
        if (materialIds.isEmpty() && session.getLearningMaterial() != null) {
            materialIds = List.of(session.getLearningMaterial().getId());
        }
        LearningMaterialSummary materialSummary = materialSummary(session, materialIds);
        return new ChatSessionResponse(
                session.getId(),
                materialIds,
                materialSummary.id(),
                materialSummary.title(),
                session.getTitle(),
                session.getCreatedAt().toString(),
                session.getUpdatedAt().toString());
    }

    private static LearningMaterialSummary materialSummary(ChatSession session, List<Long> materialIds) {
        if (!materialIds.isEmpty()) {
            var first = session.getLearningMaterials().isEmpty()
                    ? session.getLearningMaterial()
                    : session.getLearningMaterials().get(0);
            return new LearningMaterialSummary(
                    first == null ? null : first.getId(),
                    first == null ? null : first.getTitle());
        }
        return new LearningMaterialSummary(null, null);
    }

    private record LearningMaterialSummary(Long id, String title) { }
}
