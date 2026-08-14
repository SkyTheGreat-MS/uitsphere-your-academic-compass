import type { Student } from "@/context/AuthContext";
import apiClient from "./apiClient";

export type RegisterStudentData = {
  universityId: string;
  name: string;
  email: string;
  password: string;
  batch: string;
  department: string;
  year: number;
  section?: string;
};

export async function registerStudent(data: RegisterStudentData) {
  const response = await apiClient.post<Student>("/students", data);
  return response.data;
}

export async function getStudent() {
  const response = await apiClient.get<Student>("/students/profile");

  return response.data;
}

export async function updateStudent(data: Partial<Student>) {
  const response = await apiClient.put<Student>("/students/profile", data);
  return response.data;
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<Student>("/students/profile/avatar", formData);
  return response.data;
}

export async function removeAvatar() {
  const response = await apiClient.delete<Student>("/students/profile/avatar");
  return response.data;
}
