import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { pushNotification } from "./notification.controller.js";
import { isUserOnline } from "../sockets/presence.js";

const memberSelect = {
  select: {
    id: true,
    username: true,
    role: true,
    profile: { select: { displayName: true, avatarUrl: true } },
  },
};

function shapeConversation(conversation, viewerId) {
  const otherMember = conversation.members.find((m) => m.user.id !== viewerId)?.user;
  const viewerMembership = conversation.members.find((m) => m.user.id === viewerId);
  const lastMessage = conversation.messages[0] ?? null;

  return {
    id: conversation.id,
    updatedAt: conversation.updatedAt,
    otherUser: otherMember
      ? {
          id: otherMember.id,
          username: otherMember.username,
          role: otherMember.role,
          displayName: otherMember.profile?.displayName,
          avatarUrl: otherMember.profile?.avatarUrl,
          isOnline: isUserOnline(otherMember.id),
        }
      : null,
    lastMessage: lastMessage
      ? { content: lastMessage.content, senderId: lastMessage.senderId, createdAt: lastMessage.createdAt }
      : null,
    unread:
      lastMessage &&
      lastMessage.senderId !== viewerId &&
      (!viewerMembership?.lastReadAt || lastMessage.createdAt > viewerMembership.lastReadAt),
  };
}

// GET /api/conversations
export async function listConversations(req, res) {
  const conversations = await prisma.conversation.findMany({
    where: { members: { some: { userId: req.user.id } } },
    orderBy: { updatedAt: "desc" },
    include: {
      members: { include: { user: memberSelect } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  res.json({ conversations: conversations.map((c) => shapeConversation(c, req.user.id)) });
}

// POST /api/conversations  { username } — find-or-create a 1:1 conversation
export async function startConversation(req, res) {
  const { username } = req.body;
  if (!username) throw ApiError.badRequest("A username is required.");
  if (username === req.user.username) throw ApiError.badRequest("You can't message yourself.");

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) throw ApiError.notFound("User not found.");

  const [blockedByMe, blockedByThem] = await Promise.all([
    prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId: req.user.id, blockedId: target.id } } }),
    prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId: target.id, blockedId: req.user.id } } }),
  ]);
  if (blockedByMe || blockedByThem) throw ApiError.forbidden("You can't message this user.");

  const targetSettings = await prisma.userSettings.findUnique({ where: { userId: target.id } });
  const isStaff = req.user.role === "OWNER" || req.user.role === "ADMIN";
  if (targetSettings?.messagingPreference === "NO_ONE" && !isStaff) {
    throw ApiError.forbidden("This user isn't accepting messages right now.");
  }

  // Look for an existing 2-person conversation between these two users.
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { members: { some: { userId: req.user.id } } },
        { members: { some: { userId: target.id } } },
      ],
    },
    include: { members: { include: { user: memberSelect } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (existing) {
    return res.json({ conversation: shapeConversation(existing, req.user.id) });
  }

  const conversation = await prisma.conversation.create({
    data: {
      members: { create: [{ userId: req.user.id }, { userId: target.id }] },
    },
    include: { members: { include: { user: memberSelect } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  res.status(201).json({ conversation: shapeConversation(conversation, req.user.id) });
}

async function assertMember(conversationId, userId) {
  const membership = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!membership) throw ApiError.forbidden("You're not part of this conversation.");
  return membership;
}

// GET /api/conversations/:id/messages
export async function listMessages(req, res) {
  const { id } = req.params;
  await assertMember(id, req.user.id);

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: { sender: memberSelect },
  });

  res.json({
    messages: messages.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      senderId: m.senderId,
      senderUsername: m.sender.username,
    })),
  });
}

// POST /api/conversations/:id/messages  { content }
export async function sendMessage(req, res) {
  const { id } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) throw ApiError.badRequest("Message cannot be empty.");
  if (content.length > 4000) throw ApiError.badRequest("Message is too long.");

  await assertMember(id, req.user.id);

  const message = await prisma.message.create({
    data: { conversationId: id, senderId: req.user.id, content: content.trim() },
  });
  await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

  const otherMembers = await prisma.conversationMember.findMany({
    where: { conversationId: id, userId: { not: req.user.id } },
  });

  const io = req.app.get("io");
  const payload = {
    id: message.id,
    conversationId: id,
    content: message.content,
    senderId: message.senderId,
    senderUsername: req.user.username,
    createdAt: message.createdAt,
  };
  if (io) {
    io.to(`conversation:${id}`).emit("message:new", payload);
  }

  for (const member of otherMembers) {
    await pushNotification(req, {
      userId: member.userId,
      type: "NEW_MESSAGE",
      message: `${req.user.username} sent you a message.`,
      link: `/messages/${id}`,
    });
  }

  res.status(201).json({ message: payload });
}

// PATCH /api/conversations/:id/read
export async function markConversationRead(req, res) {
  const { id } = req.params;
  await assertMember(id, req.user.id);
  await prisma.conversationMember.update({
    where: { conversationId_userId: { conversationId: id, userId: req.user.id } },
    data: { lastReadAt: new Date() },
  });
  res.json({ ok: true });
}

// DELETE /api/conversations/:id — owner of the account or staff
export async function deleteConversation(req, res) {
  const { id } = req.params;
  await assertMember(id, req.user.id);
  await prisma.conversation.delete({ where: { id } });
  res.json({ ok: true });
}
