import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPublicSiteSettings } from "../controllers/publicSettings.controller.js";

const router = Router();
router.get("/", asyncHandler(getPublicSiteSettings));
export default router;
