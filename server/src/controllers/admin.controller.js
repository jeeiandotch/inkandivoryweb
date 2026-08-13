import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";

// GET /api/admin/overview
export async function getOverview(req, res) {
  const [totalUsers, totalStories, totalComments, totalMessages, viewAgg, recentUsers, recentComments, recentStories] =
    await Promise.all([
      prisma.user.count(),
      prisma.story.count(),
      prisma.comment.count({ where: { isDeleted: false } }),
      prisma.message.count(),
      prisma.story.aggregate({ _sum: { viewCount: true } }),
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, username: true, createdAt: true, profile: { select: { displayName: true } } } }),
      prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        where: { isDeleted: false },
        select: { id: true, content: true, createdAt: true, user: { select: { username: true } }, story: { select: { title: true, slug: true } } },
      }),
      prisma.story.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, slug: true, isPublished: true, createdAt: true } }),
    ]);

  res.json({
    stats: {
      totalUsers,
      totalStories,
      totalComments,
      totalMessages,
      totalViews: viewAgg._sum.viewCount || 0,
    },
    recentActivity: {
      users: recentUsers,
      comments: recentComments,
      stories: recentStories,
    },
  });
}

// GET /api/admin/users?q=
export async function listUsersAdmin(req, res) {
  const { q = "" } = req.query;
  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { profile: { displayName: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isSuspended: true,
      createdAt: true,
      profile: { select: { displayName: true } },
      _count: { select: { stories: true, comments: true } },
    },
  });
  res.json({ users });
}

// PATCH /api/admin/users/:id/suspend — toggle
export async function toggleSuspendUser(req, res) {
  const { id } = req.params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw ApiError.notFound("User not found.");
  if (target.role === "OWNER") throw ApiError.forbidden("The owner account can't be suspended.");
  if (target.role === "ADMIN" && req.user.role !== "OWNER") {
    throw ApiError.forbidden("Only the owner can suspend an admin.");
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isSuspended: !target.isSuspended },
    select: { id: true, isSuspended: true },
  });
  res.json({ user });
}

// PATCH /api/admin/users/:id/role — owner only
export async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;
  if (!["READER", "ADMIN", "OWNER"].includes(role)) throw ApiError.badRequest("Invalid role.");
  if (role === "OWNER") throw ApiError.badRequest("Ownership can't be transferred here.");

  const user = await prisma.user.update({ where: { id }, data: { role }, select: { id: true, role: true } });
  res.json({ user });
}

// GET /api/admin/stories — all stories including unpublished
export async function listStoriesAdmin(req, res) {
  const stories = await prisma.story.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      isPublished: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { username: true } },
      _count: { select: { chapters: true, comments: true, favorites: true } },
    },
  });
  res.json({ stories });
}

// GET /api/admin/comments — recent comments across all stories, for moderation
export async function listCommentsAdmin(req, res) {
  const comments = await prisma.comment.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { username: true } },
      story: { select: { title: true, slug: true } },
    },
  });
  res.json({ comments });
}

// GET /api/admin/settings
export async function getSiteSettings(req, res) {
  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  res.json({ settings });
}

// PATCH /api/admin/settings — owner only
export async function updateSiteSettings(req, res) {
  const { siteName, siteDescription, writerName, writerBio, accentColor, footerText, socialLinks } = req.body;
  const data = {};
  if (siteName !== undefined) data.siteName = siteName;
  if (siteDescription !== undefined) data.siteDescription = siteDescription;
  if (writerName !== undefined) data.writerName = writerName;
  if (writerBio !== undefined) data.writerBio = writerBio;
  if (accentColor !== undefined) data.accentColor = accentColor;
  if (footerText !== undefined) data.footerText = footerText;
  if (socialLinks !== undefined) data.socialLinks = socialLinks;

  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  res.json({ settings });
}
