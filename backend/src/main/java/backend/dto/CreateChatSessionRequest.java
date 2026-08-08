package backend.dto;

import java.util.List;

public record CreateChatSessionRequest(List<Long> materialIds, Long materialId, String title) {
}
