import { api } from "./client.js";

export async function fetchAnnouncements() {
  const { data } = await api.get("/announcements");
  return data.announcements;
}

export async function createAnnouncement(payload) {
  const { data } = await api.post("/announcements", payload);
  return data.announcement;
}

export async function updateAnnouncement(id, payload) {
  const { data } = await api.patch(`/announcements/${id}`, payload);
  return data.announcement;
}

export async function deleteAnnouncement(id) {
  await api.delete(`/announcements/${id}`);
}
