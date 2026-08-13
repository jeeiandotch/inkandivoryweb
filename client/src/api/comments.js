import { api } from "./client.js";

export async function fetchComments(storyId) {
  const { data } = await api.get(`/stories/${storyId}/comments`);
  return data.comments;
}

export async function postComment(storyId, { content, parentId }) {
  const { data } = await api.post(`/stories/${storyId}/comments`, { content, parentId });
  return data.comment;
}

export async function editComment(commentId, content) {
  const { data } = await api.patch(`/comments/${commentId}`, { content });
  return data.comment;
}

export async function deleteComment(commentId) {
  await api.delete(`/comments/${commentId}`);
}

export async function toggleCommentLike(commentId) {
  const { data } = await api.post(`/comments/${commentId}/like`);
  return data;
}
