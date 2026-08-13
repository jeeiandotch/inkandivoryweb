import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateSessionToken, hashToken } from "../utils/token.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export const SESSION_COOKIE_NAME = "ii_session";

const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,24}$/;

function cookieOptions() {
  const maxAgeMs = env.sessionMaxAgeDays * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    maxAge: maxAgeMs,
    path: "/",
  };
}

async function createSession(userId, res) {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + env.sessionMaxAgeDays * 24 * 60 * 60 * 1000);

  await prisma.session.create({ data: { tokenHash, userId, expiresAt } });
  res.cookie(SESSION_COOKIE_NAME, token, cookieOptions());
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    displayName: user.profile?.displayName,
    avatarUrl: user.profile?.avatarUrl ?? null,
    bio: user.profile?.bio ?? "",
    joinedAt: user.profile?.joinedAt ?? user.createdAt,
  };
}

export async function register(req, res) {
  const { email, password, confirmPassword, displayName, username } = req.body;

  if (!email || !password || !confirmPassword || !displayName || !username) {
    throw ApiError.badRequest("All fields are required.");
  }
  if (password !== confirmPassword) {
    throw ApiError.badRequest("Passwords do not match.");
  }
  if (password.length < 8) {
    throw ApiError.badRequest("Password must be at least 8 characters.");
  }
  if (!USERNAME_REGEX.test(username)) {
    throw ApiError.badRequest(
      "Username must be 3-24 characters: letters, numbers, underscores, or periods only."
    );
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: email.toLowerCase() }, { username }] },
  });
  if (existing) {
    throw ApiError.conflict("An account with that email or username already exists.");
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      username,
      passwordHash,
      role: "READER",
      profile: { create: { displayName } },
      settings: { create: {} },
    },
    include: { profile: true },
  });

  await createSession(user.id, res);
  res.status(201).json({ user: publicUser(user) });
}

export async function login(req, res) {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) {
    throw ApiError.badRequest("Email/username and password are required.");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername },
      ],
    },
    include: { profile: true },
  });

  if (!user) throw ApiError.unauthorized("Incorrect credentials.");
  if (user.isSuspended) throw ApiError.forbidden("This account has been suspended.");

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized("Incorrect credentials.");

  await createSession(user.id, res);
  res.json({ user: publicUser(user) });
}

export async function logout(req, res) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.session.deleteMany({ where: { tokenHash } });
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
}

export async function me(req, res) {
  if (!req.user) return res.json({ user: null });
  res.json({ user: publicUser(req.user) });
}
