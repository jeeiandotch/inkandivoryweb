import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireStaff } from "../middleware/auth.js";
import { listChapters, getChapter, createChapter, updateChapter, deleteChapter } from "../controllers/chapter.controller.js";

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(listChapters));
router.get("/:order", asyncHandler(getChapter));
router.post("/", requireStaff, asyncHandler(createChapter));

export default router;

// Chapter update/delete are addressed directly by chapter id, not nested
// under a story slug, so they're exported separately and mounted at the
// top level in app.js as /api/chapters/:id.
export const chapterByIdRouter = Router();
chapterByIdRouter.patch("/:id", requireStaff, asyncHandler(updateChapter));
chapterByIdRouter.delete("/:id", requireStaff, asyncHandler(deleteChapter));
