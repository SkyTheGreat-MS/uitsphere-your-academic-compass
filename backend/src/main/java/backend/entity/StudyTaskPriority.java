package backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum StudyTaskPriority {
    LOW, MEDIUM, HIGH;

    @JsonCreator
    public static StudyTaskPriority fromValue(String value) {
        return StudyTaskPriority.valueOf(value.trim().toUpperCase());
    }
}
