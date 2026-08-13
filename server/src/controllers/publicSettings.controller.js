import { prisma } from "../lib/prisma.js";

// GET /api/settings — public, read-only
export async function getPublicSiteSettings(req, res) {
  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  res.json({ settings });
}
