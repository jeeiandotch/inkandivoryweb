import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import OverviewTab from "./OverviewTab.jsx";
import StoriesTab from "./StoriesTab.jsx";
import UsersTab from "./UsersTab.jsx";
import CommentsModerationTab from "./CommentsModerationTab.jsx";
import AnnouncementsTab from "./AnnouncementsTab.jsx";
import SiteSettingsTab from "./SiteSettingsTab.jsx";

const TABS = [
  { key: "overview", label: "Overview", Component: OverviewTab },
  { key: "stories", label: "Stories", Component: StoriesTab },
  { key: "users", label: "Users", Component: UsersTab },
  { key: "comments", label: "Comments", Component: CommentsModerationTab },
  { key: "announcements", label: "Announcements", Component: AnnouncementsTab },
  { key: "settings", label: "Site Settings", Component: SiteSettingsTab },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const Active = TABS.find((t) => t.key === tab)?.Component || OverviewTab;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <p className="font-script text-3xl text-taupe-dark">Writer's Desk</p>
      <p className="mb-8 text-sm text-ink/50">Signed in as {user.displayName} ({user.role})</p>

      <div className="mb-8 flex flex-wrap gap-2 border-b border-ink/10 pb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              tab === t.key ? "bg-ink text-ivory" : "bg-ink/5 text-ink/60 hover:bg-ink/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Active />
    </div>
  );
}
