import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { publicUploadUrl } from "../middleware/upload.js";
import { pushNotification } from "./notification.controller.js";
import sanitizeHtml from "sanitize-html";

const authorSelect = {
  select: { id: true, username: true, profile: { select: { displayName: true, avatarUrl: true } } },
};

const SANITIZE_OPTS = {
  allowedTags: ["b", "i", "em", "strong", "a", "br", "p"],
  allowedAttributes: { a: ["href", "rel", "target"] },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
};

// GET /api/announcements — public, pinned first
export async function listAnnouncements(req, res) {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { author: authorSelect },
    take: 50,
  });
  res.json({ announcements });
}

// GET /api/announcements/:id
export async function getAnnouncement(req, res) {
  const { id } = req.params;
  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: { author: authorSelect },
  });
  if (!announcement) throw ApiError.notFound("Announcement not found.");
  res.json({ announcement });
}

// POST /api/announcements — staff only
export async function createAnnouncement(req, res) {
  const { title, content, isPinned } = req.body;
  if (!title || !content) throw ApiError.badRequest("Title and content are required.");

  const announcement = await prisma.announcement.create({
    data: { title, content: sanitizeHtml(content, SANITIZE_OPTS), isPinned: Boolean(isPinned), authorId: req.user.id },
    include: { author: authorSelect },
  });

  // Notify every reader who has announcement notifications enabled.
  const subscribers = await prisma.userSettings.findMany({
    where: { notifyOnAnnouncement: true, userId: { not: req.user.id } },
    select: { userId: true },
  });
  for (const s of subscribers) {
    await pushNotification(req, {
      userId: s.userId,
      type: "ANNOUNCEMENT",
      message: `New announcement: "${title}"`,
      link: `/announcements`,
    });
  }

  res.status(201).json({ announcement });
}

async function assertExists(id) {
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) throw ApiError.notFound("Announcement not found.");
  return announcement;
}

// PATCH /api/announcements/:id — staff only
export async function updateAnnouncement(req, res) {
  const { id } = req.params;
  await assertExists(id);

  const { title, content, isPinned } = req.body;
  const data = {};
  if (title !== undefined) data.title = title;
  if (content !== undefined) data.content = sanitizeHtml(content, SANITIZE_OPTS);
  if (isPinned !== undefined) data.isPinned = Boolean(isPinned);

  const announcement = await prisma.announcement.update({ where: { id }, data, include: { author: authorSelect } });
  res.json({ announcement });
}

// DELETE /api/announcements/:id — staff only
export async function deleteAnnouncement(req, res) {
  const { id } = req.params;
  await assertExists(id);
  await prisma.announcement.delete({ where: { id } });
  res.json({ ok: true });
}

// POST /api/announcements/:id/image — staff only
export async function uploadAnnouncementImage(req, res) {
  const { id } = req.params;
  await assertExists(id);
  if (!req.file) throw ApiError.badRequest("No image file was uploaded.");

  const imageUrl = publicUploadUrl("announcements", req.file.filename);
  const announcement = await prisma.announcement.update({
    where: { id },
    data: { imageUrl },
    include: { author: authorSelect },
  });
  res.json({ announcement });
}
