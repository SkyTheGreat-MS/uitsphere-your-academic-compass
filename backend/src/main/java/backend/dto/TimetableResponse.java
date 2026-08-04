package backend.dto;

public record TimetableResponse(String day, String subjectCode, String subjectName, String lecturer,
                                 String startTime, String endTime, String room, String type) {}
