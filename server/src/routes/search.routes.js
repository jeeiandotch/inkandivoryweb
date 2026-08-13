import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { globalSearch } from "../controllers/search.controller.js";

const router = Router();
router.get("/", asyncHandler(globalSearch));
export default router;
