import { api } from "./client.js";

export async function globalSearch(q) {
  const { data } = await api.get("/search", { params: { q } });
  return data;
}
