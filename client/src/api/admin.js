import { api } from "./client.js";

export async function fetchOverview() {
  const { data } = await api.get("/admin/overview");
  return data;
}

export async function fetchUsersAdmin(q = "") {
  const { data } = await api.get("/admin/users", { params: { q } });
  return data.users;
}

export async function toggleSuspendUser(id) {
  const { data } = await api.patch(`/admin/users/${id}/suspend`);
  return data.user;
}

export async function updateUserRole(id, role) {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  return data.user;
}

export async function fetchStoriesAdmin() {
  const { data } = await api.get("/admin/stories");
  return data.stories;
}

export async function fetchCommentsAdmin() {
  const { data } = await api.get("/admin/comments");
  return data.comments;
}

export async function deleteCommentAdmin(id) {
  await api.delete(`/admin/comments/${id}`);
}

export async function fetchSiteSettingsAdmin() {
  const { data } = await api.get("/admin/settings");
  return data.settings;
}

export async function updateSiteSettingsAdmin(payload) {
  const { data } = await api.patch("/admin/settings", payload);
  return data.settings;
}
