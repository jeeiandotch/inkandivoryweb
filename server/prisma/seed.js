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
  const genreRecords = {};
  for (const name of genres) {
    const g = await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
    });
    genreRecords[name] = g;
  }
  console.log(`  ✓ ${genres.length} default genres created`);

  // Sample reader accounts
  const readerPassword = await bcrypt.hash("ReaderPass123!", 12);
  const readerSeeds = [
    { email: "reader1@example.com", username: "quiet_paper", displayName: "Quiet Paper" },
    { email: "reader2@example.com", username: "moth_and_moon", displayName: "Moth & Moon" },
  ];
  const readers = [];
  for (const r of readerSeeds) {
    const reader = await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: {
        email: r.email,
        username: r.username,
        passwordHash: readerPassword,
        role: "READER",
        profile: { create: { displayName: r.displayName, bio: "Just here for the stories." } },
        settings: { create: {} },
      },
    });
    readers.push(reader);
  }
  console.log(`  ✓ ${readers.length} sample reader accounts created (password: ReaderPass123!)`);

  // Sample stories with chapters
  const storySeeds = [
    {
      title: "The Ivory Letters",
      description: "A slow-burn epistolary romance told through letters exchanged across a single rainy autumn.",
      genre: "Romance",
      status: "ONGOING",
      chapters: [
        { title: "The First Letter", content: "Dear stranger,\n\nI found your name written on the inside cover of a secondhand book, and I don't know why I'm writing to you except that the rain hasn't stopped in three days and your handwriting looked kind.\n\n— A." },
        { title: "The Second Letter", content: "Dear A.,\n\nI almost didn't write back. But 'kind handwriting' is the nicest thing anyone has said about me in a while, so here we are.\n\n— The Stranger" },
      ],
    },
    {
      title: "Salt and Starlight",
      description: "A lighthouse keeper's daughter discovers a map that isn't of any sea she's ever charted.",
      genre: "Fantasy",
      status: "ONGOING",
      chapters: [
        { title: "The Lantern Room", content: "The lighthouse had kept her family's secrets for four generations, and Mira had always assumed she'd never learn a single one." },
      ],
    },
    {
      title: "Small Hours",
      description: "A quiet collection of vignettes about the in-between moments of ordinary days.",
      genre: "Slice of Life",
      status: "COMPLETED",
      chapters: [
        { title: "Morning Light", content: "The kettle always sang a half-tone flat, and somehow that was the most comforting sound in the apartment." },
        { title: "The Last Train", content: "There is a particular kind of loneliness that only exists on the last train of the night, and a particular kind of company in sharing it with strangers." },
      ],
    },
  ];

  for (const s of storySeeds) {
    const slug = s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = await prisma.story.findUnique({ where: { slug } });
    if (existing) continue;

    const story = await prisma.story.create({
      data: {
        title: s.title,
        slug,
        description: s.description,
        authorId: owner.id,
        genreId: genreRecords[s.genre]?.id,
        status: s.status,
        isPublished: true,
        chapters: {
          create: s.chapters.map((c, i) => ({
            authorId: owner.id,
            title: c.title,
            content: c.content,
            order: i + 1,
            readingTime: Math.max(1, Math.round(c.content.split(/\s+/).length / 200)),
            isPublished: true,
            publishedAt: new Date(),
          })),
        },
      },
      include: { chapters: true },
    });

    // A sample comment + reply on the first chapter's story page
    if (readers.length > 0) {
      const comment = await prisma.comment.create({
        data: {
          storyId: story.id,
          userId: readers[0].id,
          content: "I did not expect to feel this much about a lighthouse. Beautifully written.",
        },
      });
      if (readers.length > 1) {
        await prisma.comment.create({
          data: {
            storyId: story.id,
            userId: readers[1].id,
            content: "Agreed — the pacing is so gentle. Can't wait for the next chapter!",
            parentId: comment.id,
          },
        });
      }
      await prisma.favorite.create({ data: { userId: readers[0].id, storyId: story.id } }).catch(() => {});
    }

    console.log(`  ✓ Sample story created: "${s.title}" (${story.chapters.length} chapters)`);
  }

  // Sample announcement
  const existingAnnouncement = await prisma.announcement.findFirst({ where: { title: "little update ♡" } });
  if (!existingAnnouncement) {
    await prisma.announcement.create({
      data: {
        authorId: owner.id,
        title: "little update ♡",
        content:
          "i've been a little slow with updates lately because classes have been keeping me busy. thank you for being patient with me and still reading my stories.",
        isPinned: true,
      },
    });
    console.log("  ✓ Sample pinned announcement created");
  }

  // Sample conversation between the owner and the first reader
  if (readers.length > 0) {
    const existingConvo = await prisma.conversation.findFirst({
      where: {
        AND: [
          { members: { some: { userId: owner.id } } },
          { members: { some: { userId: readers[0].id } } },
        ],
      },
    });
    if (!existingConvo) {
      await prisma.conversation.create({
        data: {
          members: { create: [{ userId: owner.id }, { userId: readers[0].id }] },
          messages: {
            create: [
              { senderId: readers[0].id, content: "hi!! i just finished Salt and Starlight and i'm in love" },
              { senderId: owner.id, content: "aa thank you so much, that means a lot 🥹" },
            ],
          },
        },
      });
      console.log("  ✓ Sample conversation created");
    }
  }

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
