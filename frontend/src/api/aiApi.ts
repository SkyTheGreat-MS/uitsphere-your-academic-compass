import apiClient from "./apiClient";

export type AIResponse = {
  reply?: string;
  answer?: string;
};

export async function askAI(question: string, materialId: number | null = null, context?: string) {
  const payload = {
    message: question,
    context,
    materialId,
  };

  const response = await apiClient.post<AIResponse>("/ai/chat", payload);

  return response.data;
}
