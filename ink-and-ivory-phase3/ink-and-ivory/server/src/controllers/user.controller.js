import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";

const publicProfileSelect = {
  id: true,
  username: true,
  role: true,
  createdAt: true,
  profile: { select: { displayName: true, bio: true, avatarUrl: true, joinedAt: true } },
  settings: { select: { profileVisibility: true, messagingPreference: true } },
};

// GET /api/users/search?q=
export async function searchUsers(req, res) {
  const { q = "" } = req.query;
  if (!q.trim()) return res.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      isSuspended: false,
      OR: [
        { username: { contains: q, mode: "insensitive" } },
        { profile: { displayName: { contains: q, mode: "insensitive" } } },
      ],
      ...(req.user ? { id: { not: req.user.id } } : {}),
    },
    select: publicProfileSelect,
    take: 15,
  });

  res.json({ users: users.map(shapePublicUser) });
}

function shapePublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    displayName: user.profile?.displayName,
    bio: user.profile?.bio,
    avatarUrl: user.profile?.avatarUrl,
    joinedAt: user.profile?.joinedAt ?? user.createdAt,
  };
}

// GET /api/users/:username
export async function getPublicProfile(req, res) {
  const { username } = req.params;
  const user = await prisma.user.findUnique({ where: { username }, select: publicProfileSelect });
  if (!user) throw ApiError.notFound("User not found.");

  const isSelf = req.user?.username === username;
  const isStaff = req.user && (req.user.role === "OWNER" || req.user.role === "ADMIN");
  if (user.settings?.profileVisibility === "PRIVATE" && !isSelf && !isStaff) {
    throw ApiError.forbidden("This profile is private.");
  }

  res.json({ user: shapePublicUser(user) });
}

// POST /api/users/:username/block — toggle
export async function toggleBlock(req, res) {
  const { username } = req.params;
  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) throw ApiError.notFound("User not found.");
  if (target.id === req.user.id) throw ApiError.badRequest("You can't block yourself.");

  const existing = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId: req.user.id, blockedId: target.id } },
  });

  if (existing) {
    await prisma.block.delete({ where: { id: existing.id } });
    return res.json({ blocked: false });
  }

  await prisma.block.create({ data: { blockerId: req.user.id, blockedId: target.id } });
  res.json({ blocked: true });
}
