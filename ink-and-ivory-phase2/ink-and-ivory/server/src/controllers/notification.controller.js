import { prisma } from "../lib/prisma.js";

/**
 * Creates a notification row and emits it in real time to the recipient's
 * socket room, if they're connected. Call this from any controller that
 * needs to notify a user (comments, replies, messages, announcements...).
 */
export async function pushNotification(req, { userId, type, message, link }) {
  const notification = await prisma.notification.create({
    data: { userId, type, message, link },
  });

  const io = req.app?.get?.("io");
  if (io) {
    io.to(`user:${userId}`).emit("notification:new", notification);
  }

  return notification;
}

// GET /api/notifications
export async function listNotifications(req, res) {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({
    where: { userId: req.user.id, isRead: false },
  });
  res.json({ notifications, unreadCount });
}

// PATCH /api/notifications/:id/read
export async function markNotificationRead(req, res) {
  const { id } = req.params;
  await prisma.notification.updateMany({
    where: { id, userId: req.user.id },
    data: { isRead: true },
  });
  res.json({ ok: true });
}

// PATCH /api/notifications/read-all
export async function markAllNotificationsRead(req, res) {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true },
  });
  res.json({ ok: true });
}
