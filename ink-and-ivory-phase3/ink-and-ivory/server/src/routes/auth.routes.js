import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../utils/asyncHandler.js";
import { register, login, logout, me } from "../controllers/auth.controller.js";

const router = Router();

// Tighter limiter for login/register to slow down credential stuffing / spam signups.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});

router.post("/register", authLimiter, asyncHandler(register));
router.post("/login", authLimiter, asyncHandler(login));
router.post("/logout", asyncHandler(logout));
router.get("/me", asyncHandler(me));

export default router;
