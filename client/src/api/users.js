import { api } from "./client.js";

export async function searchUsers(q) {
  const { data } = await api.get("/users/search", { params: { q } });
  return data.users;
}

export async function fetchPublicProfile(username) {
  const { data } = await api.get(`/users/${username}`);
  return data.user;
}

export async function toggleBlockUser(username) {
  const { data } = await api.post(`/users/${username}/block`);
  return data;
}
