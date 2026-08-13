import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { updateComment, deleteComment, toggleCommentLike } from "../controllers/comment.controller.js";

const router = Router();

router.patch("/:id", requireAuth, asyncHandler(updateComment));
router.delete("/:id", requireAuth, asyncHandler(deleteComment));
router.post("/:id/like", requireAuth, asyncHandler(toggleCommentLike));

export default router;
