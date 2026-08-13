import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireStaff, requireOwner } from "../middleware/auth.js";
import { uploadSiteAsset } from "../middleware/upload.js";
import { deleteComment } from "../controllers/comment.controller.js";
import {
  getOverview,
  listUsersAdmin,
  toggleSuspendUser,
  updateUserRole,
  listStoriesAdmin,
  listCommentsAdmin,
  getSiteSettings,
  updateSiteSettings,
  uploadSiteLogo,
  uploadSiteFavicon,
  uploadSiteBackground,
} from "../controllers/admin.controller.js";

const router = Router();
router.use(requireStaff);

router.get("/overview", asyncHandler(getOverview));

router.get("/users", asyncHandler(listUsersAdmin));
router.patch("/users/:id/suspend", asyncHandler(toggleSuspendUser));
router.patch("/users/:id/role", requireOwner, asyncHandler(updateUserRole));

router.get("/stories", asyncHandler(listStoriesAdmin));

router.get("/comments", asyncHandler(listCommentsAdmin));
router.delete("/comments/:id", asyncHandler(deleteComment));

router.get("/settings", asyncHandler(getSiteSettings));
router.patch("/settings", requireOwner, asyncHandler(updateSiteSettings));
router.post("/settings/logo", requireOwner, uploadSiteAsset.single("logo"), asyncHandler(uploadSiteLogo));
router.post("/settings/favicon", requireOwner, uploadSiteAsset.single("favicon"), asyncHandler(uploadSiteFavicon));
router.post("/settings/background", requireOwner, uploadSiteAsset.single("background"), asyncHandler(uploadSiteBackground));

export default router;
