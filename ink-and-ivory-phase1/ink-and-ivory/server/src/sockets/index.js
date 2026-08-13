import { hashToken } from "../utils/token.js";
import { prisma } from "../lib/prisma.js";
import { SESSION_COOKIE_NAME } from "../controllers/auth.controller.js";

/**
 * Parses the session cookie out of a raw Socket.IO handshake cookie header.
 * Phase 1: just authenticates the socket and joins a per-user room so later
 * phases (messaging, notifications) can emit directly to a user by id.
 */
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
      if (!token) return next(); // allow anonymous connection; just won't join a room

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
    }

    socket.on("disconnect", () => {
      // Presence/online-status tracking hooks in here in Phase 3.
    });
  });
}
