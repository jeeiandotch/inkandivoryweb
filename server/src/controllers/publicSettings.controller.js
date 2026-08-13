export async function getPublicSiteSettings(req, res) {
  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  if (!Array.isArray(settings.socialLinks)) {
    settings.socialLinks = [];
  }
  res.json({ settings });
}
