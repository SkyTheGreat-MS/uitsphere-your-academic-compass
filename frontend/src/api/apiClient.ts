import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
  const method = config.method?.toLowerCase();
  const isPublicAuthRequest =
    method === "post" && (config.url === "/students" || config.url === "/students/login");

  if (isPublicAuthRequest) {
    delete config.headers.Authorization;
  } else if (token && token.trim() !== "" && token !== "null" && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("student");
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
