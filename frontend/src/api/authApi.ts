import type { Student } from "@/context/AuthContext";
import apiClient from "./apiClient";

export type LoginResponse = {
  success: boolean;
  message: string;
  token: string | null;
  student: Student | null;
};

export async function loginStudent(email: string, password: string) {
  const response = await apiClient.post<LoginResponse>("/students/login", {
    email,
    password,
  });

  return response.data;
}
