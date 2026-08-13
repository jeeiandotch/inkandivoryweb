import dotenv from "dotenv";
dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  databaseUrl: required("DATABASE_URL"),
  sessionSecret: required("SESSION_SECRET", "dev-only-insecure-secret-change-me"),
  sessionMaxAgeDays: Number(process.env.SESSION_MAX_AGE_DAYS || 30),
  storageDriver: process.env.STORAGE_DRIVER || "local",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  owner: {
    email: process.env.OWNER_EMAIL || "owner@example.com",
    username: process.env.OWNER_USERNAME || "writer",
    displayName: process.env.OWNER_DISPLAY_NAME || "The Writer",
    password: process.env.OWNER_PASSWORD || "ChangeThisPassword123!",
  },
  rateLimit: {
    windowMinutes: Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 15),
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 200),
  },
  isProd: (process.env.NODE_ENV || "development") === "production",
};
