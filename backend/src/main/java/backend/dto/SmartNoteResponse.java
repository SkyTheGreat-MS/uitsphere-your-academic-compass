package backend.dto;

import backend.entity.SmartNote;
import java.util.List;

public record SmartNoteResponse(Long id, Long studentId, String title, String content, List<Long> materialIds, String createdAt, String updatedAt) {
    public static SmartNoteResponse from(SmartNote note) {
        return new SmartNoteResponse(note.getId(), note.getStudent().getId(), note.getTitle(), note.getContent(), note.getMaterialIds(), note.getCreatedAt().toString(), note.getUpdatedAt().toString());
    }
}
