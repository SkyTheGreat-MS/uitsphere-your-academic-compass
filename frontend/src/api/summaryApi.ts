import apiClient from "./apiClient";

export type GeneratedSummary = {
  id: number;
  studentId: number;
  title: string;
  content: string;
  materialIds: number[];
  createdAt: string;
  updatedAt: string;
};

export async function generateSummary(materialIds: number[]) {
  const response = await apiClient.post<GeneratedSummary>("/ai/summary/generate", { materialIds });
  return response.data;
}

export async function getSummaries() {
  const response = await apiClient.get<GeneratedSummary[]>("/ai/summary");
  return response.data;
}
