# Ink & Ivory ✒️

A full-stack personal writer website — publish stories, chapters, and announcements;
let readers comment, message you, and build a following — built with a real database,
real authentication, and real-time messaging (not a static prototype).

> **Build status: complete (6 of 6 phases).** Every feature described below is real and
> functional against a live Postgres database — there are no fake buttons, mock data, or
> silent dead ends anywhere in the app. See the **Testing checklist** near the bottom for
> what to verify after you deploy.

---

## What's actually working right now

- ✅ Real PostgreSQL database via Prisma, with the **full schema** for the entire spec
  (users, stories, chapters, comments, messaging, notifications, announcements, etc.)
  already modeled — even though most of those tables aren't wired to routes yet.
- ✅ Registration with hashed passwords (bcrypt, 12 rounds), validated username/password rules.
- ✅ Login/logout with secure, httpOnly, DB-backed sessions (not JWT-in-localStorage).
- ✅ Session persists across reloads (`GET /api/auth/me`).
- ✅ Role-based authorization scaffolding (`OWNER` / `ADMIN` / `READER`) enforced **server-side**,
  not just hidden buttons.
- ✅ Rate limiting on auth endpoints, Helmet security headers, CORS locked to your client URL.
- ✅ A real, working SVG + multi-resolution PNG/ICO favicon (verify at `/favicon.svg`, `/favicon.ico`).
- ✅ Centralized site configuration (`client/src/config/site.config.js`) — change the site name,
  writer bio, nav items, homepage CTAs, colors, etc. in one file.
- ✅ Responsive navbar with a real mobile menu (not horizontal overflow).
- ✅ Socket.IO server wired up and authenticating connections against sessions, ready for
  the messaging system in Phase 3.
- ✅ **Stories**: full CRUD (backend), public list with search/genre/status/sort filters,
  story detail page, cover image upload with real validation (type + 5MB size limit).
- ✅ **Chapters**: create/edit/delete (backend), distraction-free reader with adjustable
  font size, light/dark/sepia mode, reading width, chapter-to-chapter navigation, table of
  contents, and a live scroll-progress bar. Preferences persist in localStorage.
- ✅ **Comments**: nested replies (2 levels deep in the UI), likes, edit/delete your own,
  staff moderation, HTML sanitized server-side so nothing raw is ever rendered — plus
  automatic notifications to the story author / parent comment author.
- ✅ **Favorites & Bookmarks**: toggle from the story page, "My Library" page with tabs
  for each, bookmark can pin to a specific chapter.
- ✅ Seed data now includes 3 sample published stories with chapters, 2 sample readers,
  and sample comments/replies/favorites so the app is demoable immediately after `npm run seed`.
- ✅ **Messaging**: floating quill/ink chat-bubble icon (bottom-right), Facebook-Messenger-style
  desktop popover (conversation list → active thread) and a full-screen mobile layout. Real
  user search, real conversation creation, real-time message delivery via Socket.IO (verified
  membership before joining a conversation room — no eavesdropping), unread indicators,
  online/offline presence, blocking.
- ✅ **Notifications**: bell icon with live unread badge, dropdown list, mark-one/mark-all
  read, pushed in real time over the same socket for new comments, replies, messages, and
  announcements.
- ✅ **Announcements**: public list (pinned first), staff-only create/edit/delete/pin backend
  with sanitized HTML content and optional image upload; subscribers get a notification when
  a new announcement goes out.
- ✅ Seed data now also includes a pinned sample announcement and a sample conversation
  between the owner and a reader.
- ✅ **Writer/Admin Dashboard** (`/dashboard`, OWNER/ADMIN only, enforced server-side):
  live overview stats (readers, stories, comments, messages, total views) with recent
  activity feeds; story management (create/edit/publish-toggle/delete) with a full chapter
  editor; user management (search, suspend, role changes — owner-only for role changes,
  the owner account itself can't be suspended); comment moderation; announcement
  create/edit/delete/pin; site settings (name, description, writer bio, accent color,
  footer text) editable live by the owner and reflected via `GET /api/settings`.
- ✅ **Footer**: logo, writer name/description, nav links, social links (only rendered
  when configured — no fake/placeholder URLs), copyright, real Privacy Policy and Terms
  of Service pages.
- ✅ **Error handling & accessibility**: a React error boundary catches render crashes
  instead of a blank white screen; an offline banner appears when the connection drops;
  a proper 401/403 "Unauthorized" page instead of a silent redirect; a skip-to-content
  link; keyboard-dismissible (Escape) messenger dialog with `role="dialog"`; visible focus
  states site-wide; `prefers-reduced-motion` respected in the base stylesheet.
- ✅ **Global search** (`/search`): one query searches stories, people, tags, and genres
  at once, with real empty states.
- ✅ **About page**: writer bio, avatar, favorite genres, social links, and a "Say Hello"
  CTA — pulls the live writer name/bio from the admin-editable site settings.
- ✅ **Public profiles** (`/profile/:username`): bio, join date, role badge, a working
  "Message" button that opens the floating messenger directly on that conversation, and
  a "Block" button. Respects each user's profile-visibility setting.
- ✅ **Full Settings page** (`/settings`): Account (email/username/password change, all
  gated behind re-entering your current password), Profile (display name, bio, avatar
  upload), Preferences (reading mode/width, notification toggles), Privacy (profile
  visibility, who can message you), and a Danger Zone with a password-confirmed account
  deletion flow.

## What's not built yet

Nothing from the original spec — every listed feature has a real, working implementation.
A few things worth knowing for a production launch rather than a local demo:
- Local file storage (the default) is ephemeral on Railway across redeploys — switch
  `STORAGE_DRIVER` to a real Cloudinary setup before you rely on uploaded covers/avatars
  surviving a redeploy (the driver is pluggable; only the multer storage layer would need
  swapping for a Cloudinary SDK call).
- The Privacy Policy and Terms of Service pages are clearly-labeled starter text, not
  legal advice — replace them with real policies before opening the site to the public.
- CSRF protection relies on `sameSite` cookies (appropriate for this same-origin
  deployment); if you ever split the frontend to a different domain than the API, add an
  explicit CSRF token flow.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + React Router + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | Session cookies (httpOnly, DB-backed), bcrypt password hashing |
| Real-time | Socket.IO |
| File uploads | Local disk in dev; pluggable Cloudinary driver for production (Railway's disk is ephemeral) |

## Project Structure

```
ink-and-ivory/
├── client/                 # React + Vite frontend
│   ├── public/              # favicons, manifest
│   └── src/
│       ├── api/             # axios calls to the backend
│       ├── config/          # site.config.js — centralized customization
│       ├── context/         # AuthContext
│       ├── components/      # Navbar, ProtectedRoute, etc.
│       ├── pages/           # route-level pages
│       └── styles/          # Tailwind + design tokens
├── server/                  # Express backend
│   ├── prisma/
│   │   ├── schema.prisma    # full data model
│   │   └── seed.js          # creates the owner account + defaults
│   ├── src/
│   │   ├── config/env.js
│   │   ├── controllers/
│   │   ├── middleware/      # auth guards, error handler
│   │   ├── routes/
│   │   ├── sockets/
│   │   ├── app.js
│   │   └── index.js
│   └── uploads/              # local file storage (dev)
├── .env.example
├── railway.json
└── package.json              # npm workspaces root
```

---

## 1. Clone the repository

```bash
git clone <your-repo-url> ink-and-ivory
cd ink-and-ivory
```

## 2. Install dependencies

This is an npm workspaces monorepo — one install from the root gets both `client` and `server`.

```bash
npm install
```

## 3. Configure your environment

```bash
cp .env.example .env
```

Fill in at minimum:
- `DATABASE_URL` — your Postgres connection string
- `SESSION_SECRET` — generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `OWNER_EMAIL` / `OWNER_USERNAME` / `OWNER_PASSWORD` — your writer/admin account (used by the seed script)

## 4. Set up PostgreSQL

**Locally:** install Postgres, create a database, e.g.:
```bash
createdb ink_and_ivory
```
Then point `DATABASE_URL` at it.

**On Railway:** add a PostgreSQL plugin to your project — Railway injects `DATABASE_URL`
automatically, so you generally don't need to set it by hand in Railway's variables tab.

## 5. Run Prisma migrations

```bash
npm run prisma:migrate --workspace server -- --name init
```

This creates every table in the schema (even ones not wired to routes yet, so future
phases won't require another destructive migration for the core model).

## 6. Create the first owner/admin account

```bash
npm run seed
```

This creates your OWNER account from the `.env` values, plus default site settings and genres.
**The printed credentials are for local development only** — log in and change the password
immediately in any real deployment.

## 7. Run locally

```bash
npm run dev
```

This runs the Express API (port 4000) and the Vite dev server (port 5173) concurrently,
with the client proxying `/api` and `/uploads` to the backend. Visit `http://localhost:5173`.

## 8. Build for production

```bash
npm run build
```

Builds the client to `client/dist` and generates the Prisma client.

## 9. Deploy to Railway

1. Push this repo to GitHub.
2. Create a new Railway project → **Deploy from GitHub repo**.
3. Add a **PostgreSQL** plugin to the project (this sets `DATABASE_URL` for you).
4. In the service's **Variables** tab, set: `SESSION_SECRET`, `CLIENT_URL` (your Railway
   public URL, since the server serves the client directly in production), `NODE_ENV=production`,
   `OWNER_EMAIL`, `OWNER_USERNAME`, `OWNER_PASSWORD`.
5. Railway will run the build via `railway.json` (`npm install && npm run build`), then
   `npm run prisma:deploy && npm start`, which applies migrations and boots the server —
   which also serves the built client, so this deploys as a single service.
6. After the first deploy, run the seed script once via Railway's shell (`railway run npm run seed`)
   to create your owner account.

## Security notes

- Passwords are hashed with bcrypt (12 rounds) — never stored in plain text.
- Sessions are random 32-byte tokens, stored **hashed** in the database, set as httpOnly/secure
  cookies — not readable by client-side JS, not stored in localStorage.
- Every role check happens in Express middleware (`requireAuth`, `requireRole`) — the frontend
  hiding a button is a UX nicety, not the actual security boundary.
- `.env` is git-ignored; only `.env.example` (placeholder values) is committed.

## Roadmap

1. ✅ **Foundation** — schema, auth, config, favicon, responsive nav
2. ✅ **Stories & Reading** — stories/chapters CRUD, story reader, comments, favorites/bookmarks
3. ✅ **Social layer** — Messenger-style messaging, notifications, announcements
4. ✅ **Writer/Admin Dashboard** — stats, story/user/comment management, site settings
5. ✅ **Polish pass** — footer, legal pages, error boundary, offline state, accessibility
6. ✅ **Search & reader accounts** — global search, About page, public profiles, full settings *(this delivery — build complete)*

## Testing checklist

Run through this after you deploy (mirrors the spec's own acceptance checklist):

- [ ] `npm install && npm run prisma:migrate -- --name init && npm run seed`, then `npm run dev`
- [ ] Register a new reader account, log out, log back in
- [ ] Edit your profile (display name, bio, avatar) in Settings
- [ ] As the owner, create a story with a cover image and two chapters; publish it
- [ ] Read the story: change font size, reading mode, and width; bookmark a chapter
- [ ] Comment on the story, reply to your own comment from the reader account, like a comment
- [ ] Message the owner from the reader's profile page; confirm the message appears in
      real time without a page refresh (two browser windows, two accounts)
- [ ] Post an announcement and pin it; confirm it shows on `/announcements`
- [ ] Check the notification bell updates in real time when someone comments/messages you
- [ ] Search for the story, the owner's username, and a genre from `/search`
- [ ] As the owner, suspend the test reader account from the dashboard, then confirm that
      account can no longer log in
- [ ] Load the site on a real mobile device or a narrow browser window — check the nav,
      reader, messenger, and dashboard all remain usable
- [ ] Run `npm run build` and confirm it completes without errors
- [ ] Turn your network off — confirm the offline banner appears
