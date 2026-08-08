package backend.dto;

import backend.entity.ChatMessage;

public record ChatMessageResponse(
        Long id,
        String role,
        String content,
        String createdAt) {

    public static ChatMessageResponse from(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getRole().name(),
                message.getContent(),
                message.getCreatedAt().toString());
    }
}
