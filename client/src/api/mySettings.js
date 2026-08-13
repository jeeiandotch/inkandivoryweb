import { api } from "./client.js";

export async function fetchMySettings() {
  const { data } = await api.get("/me/settings");
  return data;
}

export async function updateMyAccount(payload) {
  const { data } = await api.patch("/me/account", payload);
  return data.account;
}

export async function updateMyProfile(payload) {
  const { data } = await api.patch("/me/profile", payload);
  return data.profile;
}

export async function uploadMyAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  const { data } = await api.post("/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.profile;
}

export async function updateMyPreferences(payload) {
  const { data } = await api.patch("/me/preferences", payload);
  return data.preferences;
}

export async function updateMyPrivacy(payload) {
  const { data } = await api.patch("/me/privacy", payload);
  return data.privacy;
}

export async function deleteMyAccount(password) {
  await api.delete("/me", { data: { password } });
}
