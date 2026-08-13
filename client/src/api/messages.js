import { api } from "./client.js";

export async function fetchConversations() {
  const { data } = await api.get("/conversations");
  return data.conversations;
}

export async function startConversation(username) {
  const { data } = await api.post("/conversations", { username });
  return data.conversation;
}

export async function fetchMessages(conversationId) {
  const { data } = await api.get(`/conversations/${conversationId}/messages`);
  return data.messages;
}

export async function sendMessage(conversationId, content) {
  const { data } = await api.post(`/conversations/${conversationId}/messages`, { content });
  return data.message;
}

export async function markConversationRead(conversationId) {
  await api.patch(`/conversations/${conversationId}/read`);
}

export async function deleteConversation(conversationId) {
  await api.delete(`/conversations/${conversationId}`);
}
