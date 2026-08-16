package backend.dto;

import backend.entity.Notification;

public record NotificationResponse(
        Long id,
        String type,
        String title,
        String message,
        String link,
        boolean read,
        String createdAt) {

    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getLink(),
                notification.isRead(),
                notification.getCreatedAt().toString());
    }
}