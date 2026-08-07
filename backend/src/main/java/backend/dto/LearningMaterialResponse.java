package backend.dto;

import backend.entity.LearningMaterial;

public record LearningMaterialResponse(
        Long id,
        String title,
        String fileName,
        String fileType,
        String status,
        String createdAt,
        String uploadedAt) {

    public static LearningMaterialResponse from(LearningMaterial material) {
        return new LearningMaterialResponse(
                material.getId(),
                material.getTitle(),
                material.getOriginalFileName(),
                material.getFileType().name(),
                material.getStatus().name(),
                material.getCreatedAt().toLocalDate().toString(),
                material.getCreatedAt().toLocalDate().toString());
    }
}
