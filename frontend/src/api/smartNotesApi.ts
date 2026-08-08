import apiClient from "./apiClient";

export type GeneratedSmartNote = {
  id: number;
  studentId: number;
  title: string;
  content: string;
  materialIds: number[];
  createdAt: string;
  updatedAt: string;
};

export async function generateSmartNotes(materialIds: number[]) {
  const response = await apiClient.post<GeneratedSmartNote>("/api/ai/notes/generate", { materialIds });
  return response.data;
}

export async function getSmartNotes() {
  const response = await apiClient.get<GeneratedSmartNote[]>("/api/ai/notes");
  return response.data;
}
