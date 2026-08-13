import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { env } from "./config/env.js";
import { attachUser } from "./middleware/auth.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import storyRoutes from "./routes/story.routes.js";
import { chapterByIdRouter } from "./routes/chapter.routes.js";
import commentByIdRoutes from "./routes/commentById.routes.js";
import libraryRoutes from "./routes/library.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
// Additional route modules are mounted below as they are built out in later
// phases: messages, announcements, admin, search, users/profiles.

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.set("trust proxy", 1); // required behind Railway's proxy for secure cookies

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(compression());
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan(env.isProd ? "combined" : "dev"));

  // Global baseline rate limit; individual routers add stricter limits where needed.
  app.use(
    rateLimit({
      windowMs: env.rateLimit.windowMinutes * 60 * 1000,
      limit: env.rateLimit.maxRequests,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use(attachUser);

  // Serve locally-stored uploads (only relevant when STORAGE_DRIVER=local)
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/api/health", (req, res) => res.json({ ok: true, env: env.nodeEnv }));

  app.use("/api/auth", authRoutes);
  app.use("/api/stories", storyRoutes);
  app.use("/api/chapters", chapterByIdRouter);
  app.use("/api/comments", commentByIdRoutes);
  app.use("/api/library", libraryRoutes);
  app.use("/api/notifications", notificationRoutes);

  // In production, this server also serves the built React client so the
  // whole app can run as a single Railway service (see railway.json).
  if (env.isProd) {
    const clientDist = path.join(__dirname, "..", "..", "client", "dist");
    app.use(express.static(clientDist));
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}
