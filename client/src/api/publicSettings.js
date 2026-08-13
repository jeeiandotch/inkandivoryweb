import { api } from "./client.js";

export async function fetchPublicSiteSettings() {
  const { data } = await api.get("/settings");
  return data.settings;
}
