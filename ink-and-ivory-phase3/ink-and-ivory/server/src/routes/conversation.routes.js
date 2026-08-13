import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import {
  listConversations,
  startConversation,
  listMessages,
  sendMessage,
  markConversationRead,
  deleteConversation,
} from "../controllers/conversation.controller.js";

const router = Router();

// Slow down message spam without blocking normal chatting.
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "You're sending messages too quickly. Please slow down." },
});

router.use(requireAuth);

router.get("/", asyncHandler(listConversations));
router.post("/", asyncHandler(startConversation));
router.get("/:id/messages", asyncHandler(listMessages));
router.post("/:id/messages", messageLimiter, asyncHandler(sendMessage));
router.patch("/:id/read", asyncHandler(markConversationRead));
router.delete("/:id", asyncHandler(deleteConversation));

export default router;
