import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { listNotifications, markNotificationRead, markAllNotificationsRead } from "../controllers/notification.controller.js";

const router = Router();
router.get("/", requireAuth, asyncHandler(listNotifications));
router.patch("/read-all", requireAuth, asyncHandler(markAllNotificationsRead));
router.patch("/:id/read", requireAuth, asyncHandler(markNotificationRead));
export default router;
