# Ink & Ivory ✒️

A full-stack personal writer website — publish stories, chapters, and announcements;
let readers comment, message you, and build a following — built with a real database,
real authentication, and real-time messaging (not a static prototype).

> **Build status:** This is **Phase 3 of 6** of the full spec. Accounts, stories, chapters,
> the reader, comments, favorites/bookmarks, real-time Messenger-style messaging,
> notifications, and announcements are all fully functional end-to-end against a real
> Postgres database and a live Socket.IO connection. Search, the writer/admin dashboard,
> and user profile/settings pages are being built in subsequent phases — their routes
> currently render "coming soon" placeholders so the app never shows a button that does
> nothing silently instead of navigating somewhere real. See **Roadmap** below.

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

## What's not built yet (placeholder pages, honestly labeled)

Global search, user profile/settings pages, and the writer/admin dashboard. These will
arrive in later phases — nothing about them is faked in the current build.

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
3. ✅ **Social layer** — Messenger-style messaging, notifications, announcements *(this delivery)*
4. ⏳ Writer/admin dashboard, role-based moderation tools
5. ⏳ Full ivory/ink visual polish across every page, animations, empty/error states
6. ⏳ Global search, user profiles/settings, final QA pass, deployment verification
