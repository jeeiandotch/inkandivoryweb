import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireStaff } from "../middleware/auth.js";
import { uploadAnnouncementImage as uploadMiddleware } from "../middleware/upload.js";
import {
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  uploadAnnouncementImage,
} from "../controllers/announcement.controller.js";

const router = Router();

router.get("/", asyncHandler(listAnnouncements));
router.get("/:id", asyncHandler(getAnnouncement));
router.post("/", requireStaff, asyncHandler(createAnnouncement));
router.patch("/:id", requireStaff, asyncHandler(updateAnnouncement));
router.delete("/:id", requireStaff, asyncHandler(deleteAnnouncement));
router.post("/:id/image", requireStaff, uploadMiddleware.single("image"), asyncHandler(uploadAnnouncementImage));

export default router;
