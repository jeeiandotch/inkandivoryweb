import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { listComments, createComment } from "../controllers/comment.controller.js";

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(listComments));
router.post("/", requireAuth, asyncHandler(createComment));

export default router;
