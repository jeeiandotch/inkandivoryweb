import { api } from "./client.js";

export async function fetchCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data.user;
}

export async function loginRequest({ emailOrUsername, password }) {
  const { data } = await api.post("/auth/login", { emailOrUsername, password });
  return data.user;
}

export async function registerRequest(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data.user;
}

export async function logoutRequest() {
  await api.post("/auth/logout");
}
