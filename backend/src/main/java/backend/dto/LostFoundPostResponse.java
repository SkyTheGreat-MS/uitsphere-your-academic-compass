package backend.dto;

import backend.entity.LostFoundPost;

public record LostFoundPostResponse(
        Long id,
        String type,
        String title,
        String description,
        String category,
        String location,
        String dateOccurred,
        String imageUrl,
        String status,
        String reporterName,
        String reporterAvatarUrl,
        boolean isOwner,
        String createdAt,
        String updatedAt) {

    public static LostFoundPostResponse from(LostFoundPost post, Long currentStudentId) {
        return new LostFoundPostResponse(
                post.getId(),
                post.getType().name(),
                post.getTitle(),
                post.getDescription(),
                post.getCategory(),
                post.getLocation(),
                post.getDateOccurred() == null ? null : post.getDateOccurred().toString(),
                post.getImageUrl(),
                post.getStatus().name(),
                post.getReporter().getName(),
                post.getReporter().getAvatarUrl(),
                post.getReporter().getId().equals(currentStudentId),
                post.getCreatedAt().toString(),
                post.getUpdatedAt().toString());
    }
}