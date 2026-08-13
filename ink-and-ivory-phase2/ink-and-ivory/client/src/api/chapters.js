import { api } from "./client.js";

export async function fetchChapters(storyId) {
  const { data } = await api.get(`/stories/${storyId}/chapters`);
  return data.chapters;
}

export async function fetchChapter(storyId, order) {
  const { data } = await api.get(`/stories/${storyId}/chapters/${order}`);
  return data;
}

export async function createChapter(storyId, payload) {
  const { data } = await api.post(`/stories/${storyId}/chapters`, payload);
  return data.chapter;
}

export async function updateChapter(chapterId, payload) {
  const { data } = await api.patch(`/chapters/${chapterId}`, payload);
  return data.chapter;
}

export async function deleteChapter(chapterId) {
  await api.delete(`/chapters/${chapterId}`);
}
