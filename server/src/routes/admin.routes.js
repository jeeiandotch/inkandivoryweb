import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireStaff, requireOwner } from "../middleware/auth.js";
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

export default router;
