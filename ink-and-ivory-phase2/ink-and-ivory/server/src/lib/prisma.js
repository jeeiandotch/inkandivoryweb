import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

// Prevent creating a new PrismaClient on every hot-reload in dev.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isProd ? ["error", "warn"] : ["error", "warn"],
  });

if (!env.isProd) {
  globalForPrisma.prisma = prisma;
}
