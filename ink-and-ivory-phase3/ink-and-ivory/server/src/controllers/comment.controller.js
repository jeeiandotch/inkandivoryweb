import sanitizeHtml from "sanitize-html";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { pushNotification } from "./notification.controller.js";

const SANITIZE_OPTS = {
  allowedTags: ["b", "i", "em", "strong", "a", "br", "p"],
  allowedAttributes: { a: ["href", "rel", "target"] },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
};

function shapeComment(comment) {
  return {
    id: comment.id,
    content: comment.isDeleted ? "[deleted]" : comment.content,
    isDeleted: comment.isDeleted,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    parentId: comment.parentId,
    likeCount: comment._count?.likes ?? comment.likeCount ?? 0,
    likedByViewer: comment.likedByViewer ?? false,
    user: {
      id: comment.user.id,
      username: comment.user.username,
      displayName: comment.user.profile?.displayName,
      avatarUrl: comment.user.profile?.avatarUrl ?? null,
    },
    replies: comment.replies ? comment.replies.map(shapeComment) : [],
  };
}

const userSelect = {
  select: { id: true, username: true, profile: { select: { displayName: true, avatarUrl: true } } },
};

// GET /api/stories/:storyId/comments — top-level comments with nested replies
export async function listComments(req, res) {
  const { storyId } = req.params;

  const comments = await prisma.comment.findMany({
    where: { storyId, parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      user: userSelect,
      _count: { select: { likes: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { user: userSelect, _count: { select: { likes: true } } },
      },
    },
  });

  let likedIds = new Set();
  if (req.user) {
    const allIds = comments.flatMap((c) => [c.id, ...c.replies.map((r) => r.id)]);
    const likes = await prisma.commentLike.findMany({
      where: { userId: req.user.id, commentId: { in: allIds } },
      select: { commentId: true },
    });
    likedIds = new Set(likes.map((l) => l.commentId));
  }

  const mark = (c) => ({ ...c, likedByViewer: likedIds.has(c.id), replies: c.replies?.map(mark) });

  res.json({ comments: comments.map((c) => shapeComment(mark(c))) });
}

// POST /api/stories/:storyId/comments — requires auth
export async function createComment(req, res) {
  const { storyId } = req.params;
  const { content, parentId } = req.body;

  if (!content || !content.trim()) throw ApiError.badRequest("Comment cannot be empty.");
  if (content.length > 2000) throw ApiError.badRequest("Comment is too long (2000 character limit).");

  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw ApiError.notFound("Story not found.");

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.storyId !== storyId) throw ApiError.badRequest("Invalid parent comment.");
  }

  const clean = sanitizeHtml(content.trim(), SANITIZE_OPTS);

  const comment = await prisma.comment.create({
    data: { storyId, userId: req.user.id, content: clean, parentId: parentId || null },
    include: { user: userSelect, _count: { select: { likes: true } } },
  });

  // Notify the story author of a top-level comment, or the parent comment's
  // author of a reply — but never notify yourself.
  const notifyUserId = parentId
    ? (await prisma.comment.findUnique({ where: { id: parentId }, select: { userId: true } }))?.userId
    : story.authorId;

  if (notifyUserId && notifyUserId !== req.user.id) {
    await pushNotification(req, {
      userId: notifyUserId,
      type: parentId ? "COMMENT_REPLY" : "STORY_COMMENT",
      message: parentId
        ? `${req.user.username} replied to your comment.`
        : `${req.user.username} commented on "${story.title}".`,
      link: `/stories/${story.slug}#comments`,
    });
  }

  res.status(201).json({ comment: shapeComment({ ...comment, replies: [] }) });
}

// PATCH /api/comments/:id — only the author, only their own comment
export async function updateComment(req, res) {
  const { id } = req.params;
  const { content } = req.body;

  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing || existing.isDeleted) throw ApiError.notFound("Comment not found.");
  if (existing.userId !== req.user.id) throw ApiError.forbidden("You can only edit your own comments.");
  if (!content || !content.trim()) throw ApiError.badRequest("Comment cannot be empty.");

  const clean = sanitizeHtml(content.trim(), SANITIZE_OPTS);
  const comment = await prisma.comment.update({
    where: { id },
    data: { content: clean },
    include: { user: userSelect, _count: { select: { likes: true } } },
  });

  res.json({ comment: shapeComment({ ...comment, replies: [] }) });
}

// DELETE /api/comments/:id — author, or staff moderating
export async function deleteComment(req, res) {
  const { id } = req.params;
  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Comment not found.");

  const isStaff = req.user.role === "OWNER" || req.user.role === "ADMIN";
  if (existing.userId !== req.user.id && !isStaff) {
    throw ApiError.forbidden("You can only delete your own comments.");
  }

  // Soft delete to preserve reply threads.
  await prisma.comment.update({ where: { id }, data: { isDeleted: true, content: "" } });
  res.json({ ok: true });
}

// POST /api/comments/:id/like — toggle
export async function toggleCommentLike(req, res) {
  const { id } = req.params;
  const existing = await prisma.commentLike.findUnique({
    where: { commentId_userId: { commentId: id, userId: req.user.id } },
  });

  if (existing) {
    await prisma.commentLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.commentLike.create({ data: { commentId: id, userId: req.user.id } });
  }

  const count = await prisma.commentLike.count({ where: { commentId: id } });
  res.json({ liked: !existing, likeCount: count });
}
