import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";
import { uploadCover } from "../middleware/upload.js";
import {
  listStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  uploadStoryCover,
  listGenres,
  listTags,
} from "../controllers/story.controller.js";
import chapterRouter from "./chapter.routes.js";
import commentRouter from "./comment.routes.js";
import { toggleFavorite, toggleBookmark } from "../controllers/library.controller.js";

const router = Router();

router.get("/genres", asyncHandler(listGenres));
router.get("/tags", asyncHandler(listTags));

router.get("/", asyncHandler(listStories));
router.post("/", requireStaff, asyncHandler(createStory));
router.get("/:slug", asyncHandler(getStory));
router.patch("/:id", requireStaff, asyncHandler(updateStory));
router.delete("/:id", requireStaff, asyncHandler(deleteStory));
router.post("/:id/cover", requireStaff, uploadCover.single("cover"), asyncHandler(uploadStoryCover));

router.post("/:id/favorite", requireAuth, asyncHandler(toggleFavorite));
router.post("/:id/bookmark", requireAuth, asyncHandler(toggleBookmark));

// Nested resources
router.use("/:storyId/chapters", chapterRouter);
router.use("/:storyId/comments", commentRouter);

export default router;
