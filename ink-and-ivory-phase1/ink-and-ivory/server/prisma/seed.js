import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const ownerEmail = (process.env.OWNER_EMAIL || "owner@example.com").toLowerCase();
  const ownerUsername = process.env.OWNER_USERNAME || "writer";
  const ownerDisplayName = process.env.OWNER_DISPLAY_NAME || "The Writer";
  const ownerPassword = process.env.OWNER_PASSWORD || "ChangeThisPassword123!";

  console.log("🌱 Seeding Ink & Ivory...\n");

  const passwordHash = await bcrypt.hash(ownerPassword, 12);

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      username: ownerUsername,
      passwordHash,
      role: "OWNER",
      profile: { create: { displayName: ownerDisplayName, bio: "Welcome to my writing sanctuary." } },
      settings: { create: {} },
    },
  });
  console.log(`  ✓ Owner account ready: ${owner.username} <${owner.email}>`);

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  console.log("  ✓ Default site settings created");

  const genres = ["Fantasy", "Romance", "Slice of Life", "Mystery", "Poetry"];
  for (const name of genres) {
    await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
    });
  }
  console.log(`  ✓ ${genres.length} default genres created`);

  console.log("\n⚠️  DEVELOPMENT ONLY credentials:");
  console.log(`    login: ${ownerEmail} (or username "${ownerUsername}")`);
  console.log(`    password: ${ownerPassword}`);
  console.log("    Change this password immediately in a real deployment.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
