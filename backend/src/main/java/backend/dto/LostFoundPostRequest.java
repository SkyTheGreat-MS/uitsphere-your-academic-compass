package backend.dto;

public record LostFoundPostRequest(
        String type,
        String title,
        String description,
        String category,
        String location,
        String dateOccurred) {
}