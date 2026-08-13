import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";

const storySummary = {
  id: true,
  title: true,
  slug: true,
  coverImageUrl: true,
  status: true,
  description: true,
  author: { select: { username: true, profile: { select: { displayName: true } } } },
};

// POST /api/stories/:id/favorite — toggle
export async function toggleFavorite(req, res) {
  const { id } = req.params;
  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) throw ApiError.notFound("Story not found.");

  const existing = await prisma.favorite.findUnique({
    where: { userId_storyId: { userId: req.user.id, storyId: id } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId: req.user.id, storyId: id } });
  }

  const count = await prisma.favorite.count({ where: { storyId: id } });
  res.json({ favorited: !existing, favoriteCount: count });
}

// POST /api/stories/:id/bookmark — toggle, optionally pinned to a chapter
export async function toggleBookmark(req, res) {
  const { id } = req.params;
  const { chapterId } = req.body;
  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) throw ApiError.notFound("Story not found.");

  const existing = await prisma.bookmark.findUnique({
    where: { userId_storyId: { userId: req.user.id, storyId: id } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return res.json({ bookmarked: false });
  }

  const bookmark = await prisma.bookmark.create({
    data: { userId: req.user.id, storyId: id, chapterId: chapterId || null },
  });
  res.json({ bookmarked: true, bookmark });
}

// GET /api/library — the signed-in reader's favorites, bookmarks
export async function getLibrary(req, res) {
  const [favorites, bookmarks] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { story: { select: storySummary } },
    }),
    prisma.bookmark.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { story: { select: storySummary } },
    }),
  ]);

  res.json({
    favorites: favorites.map((f) => f.story),
    bookmarks: bookmarks.map((b) => ({ ...b.story, bookmarkedChapterId: b.chapterId })),
  });
}
