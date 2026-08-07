import apiClient from "./apiClient";

export type LearningMaterial = {
  id: number;
  fileName: string;
  fileType: string;
  status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED";
  uploadedAt: string;
};

export async function uploadMaterial(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<LearningMaterial>("/materials/upload", formData);
  return response.data;
}

export async function getMaterials() {
  const response = await apiClient.get<LearningMaterial[]>("/materials");
  return response.data;
}

export async function deleteMaterial(id: number) {
  await apiClient.delete(`/materials/${id}`);
}
