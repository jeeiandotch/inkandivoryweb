import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { getLibrary } from "../controllers/library.controller.js";

const router = Router();
router.get("/", requireAuth, asyncHandler(getLibrary));
export default router;
