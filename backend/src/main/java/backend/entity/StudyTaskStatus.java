package backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum StudyTaskStatus {
    TODO, COMPLETED;

    @JsonCreator
    public static StudyTaskStatus fromValue(String value) {
        return StudyTaskStatus.valueOf(value.trim().toUpperCase());
    }
}
