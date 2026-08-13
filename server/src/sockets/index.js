import { hashToken } from "../utils/token.js";
import { prisma } from "../lib/prisma.js";
import { SESSION_COOKIE_NAME } from "../controllers/auth.controller.js";
import { markOnline, markOffline } from "./presence.js";

function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function registerSocketHandlers(io) {
  io.use(async (socket, next) => {
    try {
      const token = parseCookie(socket.handshake.headers.cookie, SESSION_COOKIE_NAME);
      if (!token) return next(); // allow anonymous connection; just won't join a user room

      const tokenHash = hashToken(token);
      const session = await prisma.session.findUnique({ where: { tokenHash } });
      if (session && session.expiresAt > new Date()) {
        socket.userId = session.userId;
      }
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on("connection", (socket) => {
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      markOnline(socket.userId);
      io.emit("presence:update", { userId: socket.userId, online: true });
    }

    // Client asks to join a conversation room after fetching it via REST —
    // we verify membership here so a socket can't eavesdrop on a conversation
    // it isn't part of.
    socket.on("conversation:join", async (conversationId, ack) => {
      try {
        if (!socket.userId) return ack?.({ ok: false, error: "Not authenticated." });
        const membership = await prisma.conversationMember.findUnique({
          where: { conversationId_userId: { conversationId, userId: socket.userId } },
        });
        if (!membership) return ack?.({ ok: false, error: "Not a member of this conversation." });
        socket.join(`conversation:${conversationId}`);
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: "Failed to join conversation." });
      }
    });

    socket.on("conversation:leave", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        markOffline(socket.userId);
        io.emit("presence:update", { userId: socket.userId, online: false });
      }
    });
  });
}
