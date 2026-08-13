import { prisma } from "../lib/prisma.js";
import { hashToken } from "../utils/token.js";
import { ApiError } from "../utils/ApiError.js";
import { SESSION_COOKIE_NAME } from "../controllers/auth.controller.js";

/**
 * Populates req.user (or leaves it undefined) based on the session cookie.
 * Always calls next() — use requireAuth/requireRole to actually gate routes.
 */
export async function attachUser(req, res, next) {
  try {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    if (!token) return next();

    const tokenHash = hashToken(token);
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: { include: { profile: true } } },
    });

    if (!session || session.expiresAt < new Date()) {
      return next();
    }

    if (session.user.isSuspended) {
      return next();
    }

    req.user = session.user;
    req.sessionId = session.id;
    next();
  } catch (err) {
    next(err);
  }
}

// Backend permission checks — never trust the frontend alone (spec section 17).
export function requireAuth(req, res, next) {
  if (!req.user) return next(ApiError.unauthorized());
  next();
}

export function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}

export const requireOwner = requireRole("OWNER");
export const requireStaff = requireRole("OWNER", "ADMIN");
