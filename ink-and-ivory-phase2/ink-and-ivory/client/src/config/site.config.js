/**
 * ─── Ink & Ivory — Site Configuration ──────────────────────────────────
 * Edit this file to customize the website without touching component code.
 * Some of these values (siteName, accentColor, etc.) are also editable live
 * from the admin dashboard and stored in the database — those act as
 * overrides layered on top of these defaults. See src/context/SiteContext.jsx.
 */

export const siteConfig = {
  siteName: "Ink & Ivory",
  siteDescription: "Stories written in ink, memories preserved in ivory.",
  tagline: "an online writing sanctuary",

  writer: {
    name: "The Writer",
    username: "writer",
    bio: "Welcome to my writing sanctuary — a quiet corner for stories, letters, and late-night musings.",
    avatarUrl: "/default-avatar.png",
  },

  theme: {
    accentColor: "#a67c6d", // taupe
    secondaryAccent: "#c98f92", // dusty rose
    backgroundColor: "#faf6ef", // ivory
    textColor: "#241f1c", // ink
  },

  nav: {
    primary: [
      { label: "Home", path: "/" },
      { label: "Stories", path: "/stories" },
      { label: "About", path: "/about" },
      { label: "Announcements", path: "/announcements" },
    ],
  },

  homepage: {
    heroTitle: "Ink & Ivory",
    heroSubtitle: "Stories written in ink, memories preserved in ivory.",
    ctas: [
      { label: "Read My Stories", path: "/stories", style: "primary" },
      { label: "Meet the Writer", path: "/about", style: "secondary" },
      { label: "Join the Community", path: "/register", style: "ghost" },
    ],
    sections: [
      "writerIntroduction",
      "featuredStories",
      "latestStories",
      "recentlyUpdated",
      "announcementPreview",
      "communitySection",
    ],
  },

  social: {
    // Set to null to hide a link entirely — footer/about page respect this.
    twitter: null,
    instagram: null,
    tumblr: null,
    ko_fi: null,
    website: null,
  },

  footer: {
    text: "A quiet place for stories, written with ink and kept on ivory pages.",
    showPrivacyPolicy: true,
    showTermsOfService: true,
  },

  storyCategories: {
    genres: ["Fantasy", "Romance", "Slice of Life", "Mystery", "Poetry"],
    statuses: [
      { value: "ONGOING", label: "Ongoing" },
      { value: "COMPLETED", label: "Completed" },
      { value: "HIATUS", label: "On Hiatus" },
      { value: "COMING_SOON", label: "Coming Soon" },
    ],
  },
};

export default siteConfig;
