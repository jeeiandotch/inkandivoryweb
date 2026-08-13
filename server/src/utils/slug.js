import slugify from "slugify";
import { prisma } from "../lib/prisma.js";

export async function generateUniqueSlug(title, { excludeId } = {}) {
  const base = slugify(title, { lower: true, strict: true }) || "story";
  let slug = base;
  let counter = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.story.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export function estimateReadingTime(text) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
