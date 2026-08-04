import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const method = config.method?.toLowerCase();
  const isPublicAuthRequest =
    method === "post" && (config.url === "/students" || config.url === "/students/login");

  if (isPublicAuthRequest) {
    delete config.headers.Authorization;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
