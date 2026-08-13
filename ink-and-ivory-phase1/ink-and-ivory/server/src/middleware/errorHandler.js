import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Route not found." });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details ?? undefined,
    });
  }

  // Prisma known errors
  if (err.code === "P2002") {
    return res.status(409).json({ error: "That value is already in use." });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "That record couldn't be found." });
  }

  console.error(err);
  return res.status(500).json({
    error: "Something went wrong on our end.",
    ...(env.isProd ? {} : { message: err.message, stack: err.stack }),
  });
}
