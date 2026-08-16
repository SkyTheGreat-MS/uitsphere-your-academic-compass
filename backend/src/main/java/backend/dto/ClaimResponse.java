package backend.dto;

import backend.entity.LostFoundClaim;

public record ClaimResponse(
        Long id,
        Long postId,
        String postTitle,
        String postType,
        String postImageUrl,
        String claimantName,
        String claimantAvatarUrl,
        String message,
        String details,
        String status,
        String createdAt,
        String updatedAt) {

    public static ClaimResponse from(LostFoundClaim claim) {
        return new ClaimResponse(
                claim.getId(),
                claim.getPost().getId(),
                claim.getPost().getTitle(),
                claim.getPost().getType().name(),
                claim.getPost().getImageUrl(),
                claim.getClaimant().getName(),
                claim.getClaimant().getAvatarUrl(),
                claim.getMessage(),
                claim.getDetails(),
                claim.getStatus().name(),
                claim.getCreatedAt().toString(),
                claim.getUpdatedAt().toString());
    }
}