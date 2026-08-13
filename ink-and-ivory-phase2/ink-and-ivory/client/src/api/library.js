import { api } from "./client.js";

export async function fetchLibrary() {
  const { data } = await api.get("/library");
  return data;
}
