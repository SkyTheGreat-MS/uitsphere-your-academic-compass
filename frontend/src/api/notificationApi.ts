import apiClient from "./apiClient";

export type AppNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
};

export async function getNotifications() {
  const response = await apiClient.get<AppNotification[]>("/api/notifications");
  return response.data;
}

export async function getUnreadCount() {
  const response = await apiClient.get<number>("/api/notifications/unread-count");
  return response.data;
}

export async function markNotificationRead(id: number) {
  const response = await apiClient.put<AppNotification>(`/api/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsRead() {
  await apiClient.put("/api/notifications/read-all");
}

export async function deleteNotification(id: number) {
  await apiClient.delete(`/api/notifications/${id}`);
}
