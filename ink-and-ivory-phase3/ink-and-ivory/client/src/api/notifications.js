import { api } from "./client.js";

export async function fetchNotifications() {
  const { data } = await api.get("/notifications");
  return data;
}

export async function markNotificationRead(id) {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await api.patch("/notifications/read-all");
}
