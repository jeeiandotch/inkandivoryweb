import { prisma } from "../lib/prisma.js";

// GET /api/search?q=
export async function globalSearch(req, res) {
  const { q = "" } = req.query;
  const query = q.trim();

  if (!query) {
    return res.json({ stories: [], users: [], tags: [], genres: [] });
  }

  const [stories, users, tags, genres] = await Promise.all([
    prisma.story.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImageUrl: true,
        description: true,
        status: true,
        author: { select: { username: true, profile: { select: { displayName: true } } } },
      },
    }),
    prisma.user.findMany({
      where: {
        isSuspended: false,
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { profile: { displayName: { contains: query, mode: "insensitive" } } },
        ],
      },
      take: 10,
      select: { id: true, username: true, role: true, profile: { select: { displayName: true, avatarUrl: true } } },
    }),
    prisma.tag.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: 10,
    }),
    prisma.genre.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: 10,
    }),
  ]);

  res.json({
    stories,
    users: users.map((u) => ({ id: u.id, username: u.username, role: u.role, displayName: u.profile?.displayName, avatarUrl: u.profile?.avatarUrl })),
    tags,
    genres,
  });
}
