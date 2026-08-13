import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { ApiError } from "../utils/ApiError.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT = path.join(__dirname, "..", "..", "uploads");

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Railway's build/deploy process doesn't always preserve empty folders that
// only contain a .gitkeep file, so create them at runtime if missing.
for (const subfolder of ["avatars", "covers", "announcements"]) {
  const dir = path.join(UPLOADS_ROOT, subfolder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function makeStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(UPLOADS_ROOT, subfolder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
      cb(null, safeName);
    },
  });
}

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIME.has(file.mimetype) || !ALLOWED_EXT.has(ext)) {
    return cb(ApiError.badRequest("Only JPG, PNG, WEBP, or GIF images are allowed."));
  }
  cb(null, true);
}

function makeUploader(subfolder) {
  return multer({
    storage: makeStorage(subfolder),
    fileFilter,
    limits: { fileSize: MAX_SIZE_BYTES },
  });
}

export const uploadCover = makeUploader("covers");
export const uploadAvatar = makeUploader("avatars");
export const uploadAnnouncementImage = makeUploader("announcements");

export function publicUploadUrl(subfolder, filename) {
  return `/uploads/${subfolder}/${filename}`;
}
