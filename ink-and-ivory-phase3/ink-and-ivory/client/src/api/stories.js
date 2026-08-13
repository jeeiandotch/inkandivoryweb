import { api } from "./client.js";

export async function fetchStories(params = {}) {
  const { data } = await api.get("/stories", { params });
  return data.stories;
}

export async function fetchStory(slug) {
  const { data } = await api.get(`/stories/${slug}`);
  return data;
}

export async function createStory(payload) {
  const { data } = await api.post("/stories", payload);
  return data.story;
}

export async function updateStory(id, payload) {
  const { data } = await api.patch(`/stories/${id}`, payload);
  return data.story;
}

export async function deleteStory(id) {
  await api.delete(`/stories/${id}`);
}

export async function uploadStoryCover(id, file) {
  const formData = new FormData();
  formData.append("cover", file);
  const { data } = await api.post(`/stories/${id}/cover`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.story;
}

export async function toggleFavorite(storyId) {
  const { data } = await api.post(`/stories/${storyId}/favorite`);
  return data;
}

export async function toggleBookmark(storyId, chapterId) {
  const { data } = await api.post(`/stories/${storyId}/bookmark`, { chapterId });
  return data;
}

export async function fetchGenres() {
  const { data } = await api.get("/stories/genres");
  return data.genres;
}

export async function fetchTags() {
  const { data } = await api.get("/stories/tags");
  return data.tags;
}
