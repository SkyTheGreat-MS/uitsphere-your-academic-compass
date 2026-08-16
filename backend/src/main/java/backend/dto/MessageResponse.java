package backend.dto;

import backend.entity.ClaimMessage;

public record MessageResponse(
        Long id,
        Long claimId,
        Long senderId,
        String senderName,
        String senderAvatarUrl,
        String content,
        String createdAt) {

    public static MessageResponse from(ClaimMessage message) {
        return new MessageResponse(
                message.getId(),
                message.getClaim().getId(),
                message.getSender().getId(),
                message.getSender().getName(),
                message.getSender().getAvatarUrl(),
                message.getContent(),
                message.getCreatedAt().toString());
    }
}