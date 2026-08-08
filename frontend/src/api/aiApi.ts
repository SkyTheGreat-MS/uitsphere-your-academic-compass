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
  console.debug("POST /ai/chat payload:", JSON.stringify(payload));

  const response = await apiClient.post<AIResponse>("/ai/chat", payload);

  return response.data;
}
