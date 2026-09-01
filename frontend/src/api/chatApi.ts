import apiClient from "./apiClient";

export type ChatSession = {
  id: number;
  materialIds: number[];
  materialId: number | null;
  materialTitle: string | null;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatHistoryMessage = {
  id: number;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
};

export async function createChatSession(materialIds: number[] = [], title?: string) {
  const response = await apiClient.post<ChatSession>("/api/chat/sessions", { materialIds, title });
  return response.data;
}

export async function getChatSessions() {
  const response = await apiClient.get<ChatSession[]>("/api/chat/sessions");
  return response.data;
}

export async function getChatMessages(sessionId: number) {
  const response = await apiClient.get<ChatHistoryMessage[]>(`/api/chat/sessions/${sessionId}/messages`);
  return response.data;
}

export async function sendChatMessage(sessionId: number, message: string, materialIds: number[] = []) {
  const response = await apiClient.post<ChatHistoryMessage>("/api/chat/message", {
    sessionId,
    message,
    materialIds,
  });
  return response.data;
}

export async function deleteChatSession(sessionId: number) {
  await apiClient.delete(`/api/chat/sessions/${sessionId}`);
}
