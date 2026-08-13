import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadAvatar } from "../middleware/upload.js";
import {
  getMySettings,
  updateMyAccount,
  updateMyProfile,
  uploadMyAvatar,
  updateMyPreferences,
  updateMyPrivacy,
  deleteMyAccount,
} from "../controllers/mySettings.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/settings", asyncHandler(getMySettings));
router.patch("/account", asyncHandler(updateMyAccount));
router.patch("/profile", asyncHandler(updateMyProfile));
router.post("/avatar", uploadAvatar.single("avatar"), asyncHandler(uploadMyAvatar));
router.patch("/preferences", asyncHandler(updateMyPreferences));
router.patch("/privacy", asyncHandler(updateMyPrivacy));
router.delete("/", asyncHandler(deleteMyAccount));

export default router;
