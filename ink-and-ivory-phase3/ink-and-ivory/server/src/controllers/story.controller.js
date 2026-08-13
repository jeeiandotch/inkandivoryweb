import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { generateUniqueSlug } from "../utils/slug.js";
import { publicUploadUrl } from "../middleware/upload.js";

const storyCardSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  coverImageUrl: true,
  status: true,
  seriesName: true,
  seriesOrder: true,
  viewCount: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
  genre: { select: { id: true, name: true, slug: true } },
  tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
  author: { select: { id: true, username: true, profile: { select: { displayName: true, avatarUrl: true } } } },
  _count: { select: { favorites: true, comments: true, chapters: true } },
};

function shapeStory(story) {
  if (!story) return null;
  return {
    ...story,
    tags: story.tags?.map((t) => t.tag) ?? [],
    favoriteCount: story._count?.favorites ?? 0,
    commentCount: story._count?.comments ?? 0,
    chapterCount: story._count?.chapters ?? 0,
  };
}

// GET /api/stories — public list with filters, search, and sort
export async function listStories(req, res) {
  const { genre, tag, status, q, sort = "latest", authorOnly } = req.query;
  const isStaffViewingOwn = req.user && (req.user.role === "OWNER" || req.user.role === "ADMIN");

  const where = {
    ...(isStaffViewingOwn && authorOnly === "true" ? {} : { isPublished: true }),
    ...(genre ? { genre: { slug: genre } } : {}),
    ...(status ? { status } : {}),
    ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "popular"
      ? [{ viewCount: "desc" }]
      : sort === "updated"
      ? [{ updatedAt: "desc" }]
      : [{ createdAt: "desc" }];

  const stories = await prisma.story.findMany({
    where,
    orderBy,
    select: storyCardSelect,
    take: 60,
  });

  res.json({ stories: stories.map(shapeStory) });
}

// GET /api/stories/:slug — full story detail (increments view count for readers)
export async function getStory(req, res) {
  const { slug } = req.params;

  const story = await prisma.story.findUnique({
    where: { slug },
    select: {
      ...storyCardSelect,
      contentWarnings: true,
      chapters: {
        select: {
          id: true,
          title: true,
          order: true,
          readingTime: true,
          isPublished: true,
          publishedAt: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!story) throw ApiError.notFound("Story not found.");

  const isStaff = req.user && (req.user.role === "OWNER" || req.user.role === "ADMIN");
  if (!story.isPublished && !isStaff) throw ApiError.notFound("Story not found.");

  // Hide unpublished chapters from non-staff
  const chapters = isStaff ? story.chapters : story.chapters.filter((c) => c.isPublished);

  if (!isStaff) {
    await prisma.story.update({ where: { id: story.id }, data: { viewCount: { increment: 1 } } });
  }

  let viewerState = null;
  if (req.user) {
    const [favorite, bookmark] = await Promise.all([
      prisma.favorite.findUnique({ where: { userId_storyId: { userId: req.user.id, storyId: story.id } } }),
      prisma.bookmark.findUnique({ where: { userId_storyId: { userId: req.user.id, storyId: story.id } } }),
    ]);
    viewerState = { isFavorited: Boolean(favorite), isBookmarked: Boolean(bookmark), bookmarkedChapterId: bookmark?.chapterId ?? null };
  }

  res.json({ story: { ...shapeStory(story), chapters }, viewerState });
}

// POST /api/stories — staff only
export async function createStory(req, res) {
  const { title, description, genreId, status, contentWarnings, seriesName, seriesOrder, tags } = req.body;

  if (!title || !description) throw ApiError.badRequest("Title and description are required.");

  const slug = await generateUniqueSlug(title);

  const tagNames = Array.isArray(tags) ? tags.filter(Boolean) : [];
  const tagConnectOps = [];
  for (const name of tagNames) {
    const tagSlug = name.toLowerCase().trim().replace(/\s+/g, "-");
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, slug: tagSlug },
    });
    tagConnectOps.push({ tagId: tag.id });
  }

  const story = await prisma.story.create({
    data: {
      title,
      slug,
      description,
      authorId: req.user.id,
      genreId: genreId || null,
      status: status || "ONGOING",
      contentWarnings: Array.isArray(contentWarnings) ? contentWarnings : [],
      seriesName: seriesName || null,
      seriesOrder: seriesOrder ? Number(seriesOrder) : null,
      tags: { create: tagConnectOps },
    },
    select: storyCardSelect,
  });

  res.status(201).json({ story: shapeStory(story) });
}

async function assertStoryEditable(storyId, user) {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw ApiError.notFound("Story not found.");
  if (user.role !== "OWNER" && story.authorId !== user.id) {
    throw ApiError.forbidden("You can only edit your own stories.");
  }
  return story;
}

// PATCH /api/stories/:id — staff only, author or owner
export async function updateStory(req, res) {
  const { id } = req.params;
  await assertStoryEditable(id, req.user);

  const { title, description, genreId, status, contentWarnings, seriesName, seriesOrder, isPublished } = req.body;

  const data = {};
  if (title !== undefined) {
    data.title = title;
    data.slug = await generateUniqueSlug(title, { excludeId: id });
  }
  if (description !== undefined) data.description = description;
  if (genreId !== undefined) data.genreId = genreId || null;
  if (status !== undefined) data.status = status;
  if (contentWarnings !== undefined) data.contentWarnings = contentWarnings;
  if (seriesName !== undefined) data.seriesName = seriesName || null;
  if (seriesOrder !== undefined) data.seriesOrder = seriesOrder ? Number(seriesOrder) : null;
  if (isPublished !== undefined) data.isPublished = Boolean(isPublished);

  const story = await prisma.story.update({ where: { id }, data, select: storyCardSelect });
  res.json({ story: shapeStory(story) });
}

// DELETE /api/stories/:id — staff only, author or owner
export async function deleteStory(req, res) {
  const { id } = req.params;
  await assertStoryEditable(id, req.user);
  await prisma.story.delete({ where: { id } });
  res.json({ ok: true });
}

// POST /api/stories/:id/cover — staff only, multipart upload
export async function uploadStoryCover(req, res) {
  const { id } = req.params;
  await assertStoryEditable(id, req.user);

  if (!req.file) throw ApiError.badRequest("No image file was uploaded.");

  const coverImageUrl = publicUploadUrl("covers", req.file.filename);
  const story = await prisma.story.update({
    where: { id },
    data: { coverImageUrl },
    select: storyCardSelect,
  });

  res.json({ story: shapeStory(story) });
}

// GET /api/genres — public, used to populate filters/forms
export async function listGenres(req, res) {
  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
  res.json({ genres });
}

// GET /api/tags — public, used to populate filters/forms
export async function listTags(req, res) {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" }, take: 100 });
  res.json({ tags });
}
