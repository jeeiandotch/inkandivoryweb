import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { estimateReadingTime } from "../utils/slug.js";

async function getStoryOr404(storyId) {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw ApiError.notFound("Story not found.");
  return story;
}

function assertStaffOwnsStory(story, user) {
  if (user.role !== "OWNER" && story.authorId !== user.id) {
    throw ApiError.forbidden("You can only manage chapters on your own stories.");
  }
}

// GET /api/stories/:storyId/chapters — table of contents
export async function listChapters(req, res) {
  const { storyId } = req.params;
  const isStaff = req.user && (req.user.role === "OWNER" || req.user.role === "ADMIN");

  const chapters = await prisma.chapter.findMany({
    where: { storyId, ...(isStaff ? {} : { isPublished: true }) },
    orderBy: { order: "asc" },
    select: { id: true, title: true, order: true, readingTime: true, isPublished: true, publishedAt: true },
  });

  res.json({ chapters });
}

// GET /api/stories/:storyId/chapters/:order — full chapter content + prev/next
export async function getChapter(req, res) {
  const { storyId, order } = req.params;
  const orderNum = Number(order);
  const isStaff = req.user && (req.user.role === "OWNER" || req.user.role === "ADMIN");

  const chapter = await prisma.chapter.findUnique({
    where: { storyId_order: { storyId, order: orderNum } },
  });

  if (!chapter || (!chapter.isPublished && !isStaff)) {
    throw ApiError.notFound("Chapter not found.");
  }

  const [prev, next, story] = await Promise.all([
    prisma.chapter.findFirst({
      where: { storyId, order: { lt: orderNum }, ...(isStaff ? {} : { isPublished: true }) },
      orderBy: { order: "desc" },
      select: { order: true, title: true },
    }),
    prisma.chapter.findFirst({
      where: { storyId, order: { gt: orderNum }, ...(isStaff ? {} : { isPublished: true }) },
      orderBy: { order: "asc" },
      select: { order: true, title: true },
    }),
    prisma.story.findUnique({ where: { id: storyId }, select: { title: true, slug: true } }),
  ]);

  res.json({ chapter, prev, next, story });
}

// POST /api/stories/:storyId/chapters — staff only
export async function createChapter(req, res) {
  const { storyId } = req.params;
  const story = await getStoryOr404(storyId);
  assertStaffOwnsStory(story, req.user);

  const { title, content, order, isPublished } = req.body;
  if (!title || !content || order === undefined) {
    throw ApiError.badRequest("Title, content, and order are required.");
  }

  const chapter = await prisma.chapter.create({
    data: {
      storyId,
      authorId: req.user.id,
      title,
      content,
      order: Number(order),
      readingTime: estimateReadingTime(content),
      isPublished: Boolean(isPublished),
      publishedAt: isPublished ? new Date() : null,
    },
  });

  res.status(201).json({ chapter });
}

// PATCH /api/chapters/:id — staff only
export async function updateChapter(req, res) {
  const { id } = req.params;
  const existing = await prisma.chapter.findUnique({ where: { id }, include: { story: true } });
  if (!existing) throw ApiError.notFound("Chapter not found.");
  assertStaffOwnsStory(existing.story, req.user);

  const { title, content, order, isPublished } = req.body;
  const data = {};
  if (title !== undefined) data.title = title;
  if (content !== undefined) {
    data.content = content;
    data.readingTime = estimateReadingTime(content);
  }
  if (order !== undefined) data.order = Number(order);
  if (isPublished !== undefined) {
    data.isPublished = Boolean(isPublished);
    if (isPublished && !existing.publishedAt) data.publishedAt = new Date();
  }

  const chapter = await prisma.chapter.update({ where: { id }, data });
  res.json({ chapter });
}

// DELETE /api/chapters/:id — staff only
export async function deleteChapter(req, res) {
  const { id } = req.params;
  const existing = await prisma.chapter.findUnique({ where: { id }, include: { story: true } });
  if (!existing) throw ApiError.notFound("Chapter not found.");
  assertStaffOwnsStory(existing.story, req.user);

  await prisma.chapter.delete({ where: { id } });
  res.json({ ok: true });
}
