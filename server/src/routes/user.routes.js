import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { searchUsers, getPublicProfile, toggleBlock } from "../controllers/user.controller.js";

const router = Router();

router.get("/search", asyncHandler(searchUsers));
router.get("/:username", asyncHandler(getPublicProfile));
router.post("/:username/block", requireAuth, asyncHandler(toggleBlock));

export default router;
