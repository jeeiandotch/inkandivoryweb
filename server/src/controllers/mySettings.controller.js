import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { publicUploadUrl } from "../middleware/upload.js";

const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,24}$/;

// GET /api/me/settings
export async function getMySettings(req, res) {
  const full = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { profile: true, settings: true },
  });
  res.json({
    account: { email: full.email, username: full.username },
    profile: { displayName: full.profile?.displayName, bio: full.profile?.bio, avatarUrl: full.profile?.avatarUrl },
    preferences: {
      theme: full.settings?.theme,
      readingFontSize: full.settings?.readingFontSize,
      readingWidth: full.settings?.readingWidth,
      notifyOnComment: full.settings?.notifyOnComment,
      notifyOnMessage: full.settings?.notifyOnMessage,
      notifyOnAnnouncement: full.settings?.notifyOnAnnouncement,
    },
    privacy: {
      profileVisibility: full.settings?.profileVisibility,
      messagingPreference: full.settings?.messagingPreference,
    },
  });
}

// PATCH /api/me/account — email, username, or password (current password required for any change)
export async function updateMyAccount(req, res) {
  const { email, username, currentPassword, newPassword } = req.body;
  if (!currentPassword) throw ApiError.badRequest("Enter your current password to make account changes.");

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) throw ApiError.unauthorized("Current password is incorrect.");

  const data = {};
  if (email && email.toLowerCase() !== user.email) {
    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) throw ApiError.conflict("That email is already in use.");
    data.email = email.toLowerCase();
  }
  if (username && username !== user.username) {
    if (!USERNAME_REGEX.test(username)) {
      throw ApiError.badRequest("Username must be 3-24 characters: letters, numbers, underscores, or periods only.");
    }
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) throw ApiError.conflict("That username is already taken.");
    data.username = username;
  }
  if (newPassword) {
    if (newPassword.length < 8) throw ApiError.badRequest("New password must be at least 8 characters.");
    data.passwordHash = await hashPassword(newPassword);
  }

  const updated = await prisma.user.update({ where: { id: req.user.id }, data });
  res.json({ account: { email: updated.email, username: updated.username } });
}

// PATCH /api/me/profile — displayName, bio
export async function updateMyProfile(req, res) {
  const { displayName, bio } = req.body;
  const data = {};
  if (displayName !== undefined) data.displayName = displayName;
  if (bio !== undefined) data.bio = bio;

  const profile = await prisma.profile.update({ where: { userId: req.user.id }, data });
  res.json({ profile: { displayName: profile.displayName, bio: profile.bio, avatarUrl: profile.avatarUrl } });
}

// POST /api/me/avatar
export async function uploadMyAvatar(req, res) {
  if (!req.file) throw ApiError.badRequest("No image file was uploaded.");
  const avatarUrl = publicUploadUrl("avatars", req.file.filename);
  const profile = await prisma.profile.update({ where: { userId: req.user.id }, data: { avatarUrl } });
  res.json({ profile: { displayName: profile.displayName, bio: profile.bio, avatarUrl: profile.avatarUrl } });
}

// PATCH /api/me/preferences
export async function updateMyPreferences(req, res) {
  const { theme, readingFontSize, readingWidth, notifyOnComment, notifyOnMessage, notifyOnAnnouncement } = req.body;
  const data = {};
  if (theme !== undefined) data.theme = theme;
  if (readingFontSize !== undefined) data.readingFontSize = Number(readingFontSize);
  if (readingWidth !== undefined) data.readingWidth = readingWidth;
  if (notifyOnComment !== undefined) data.notifyOnComment = Boolean(notifyOnComment);
  if (notifyOnMessage !== undefined) data.notifyOnMessage = Boolean(notifyOnMessage);
  if (notifyOnAnnouncement !== undefined) data.notifyOnAnnouncement = Boolean(notifyOnAnnouncement);

  const settings = await prisma.userSettings.update({ where: { userId: req.user.id }, data });
  res.json({ preferences: settings });
}

// PATCH /api/me/privacy
export async function updateMyPrivacy(req, res) {
  const { profileVisibility, messagingPreference } = req.body;
  const data = {};
  if (profileVisibility !== undefined) data.profileVisibility = profileVisibility;
  if (messagingPreference !== undefined) data.messagingPreference = messagingPreference;

  const settings = await prisma.userSettings.update({ where: { userId: req.user.id }, data });
  res.json({ privacy: { profileVisibility: settings.profileVisibility, messagingPreference: settings.messagingPreference } });
}

// DELETE /api/me — requires password confirmation, blocked for the OWNER account
export async function deleteMyAccount(req, res) {
  const { password } = req.body;
  if (!password) throw ApiError.badRequest("Enter your password to confirm account deletion.");
  if (req.user.role === "OWNER") throw ApiError.forbidden("The owner account can't be deleted from here.");

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized("Password is incorrect.");

  await prisma.user.delete({ where: { id: req.user.id } });
  res.clearCookie("ii_session", { path: "/" });
  res.json({ ok: true });
}
