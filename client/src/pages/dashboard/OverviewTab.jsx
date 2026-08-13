import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOverview } from "../../api/admin.js";

function StatCard({ label, value }) {
  return (
    <div className="card p-5 text-center">
      <p className="font-display text-3xl text-ink">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink/50">{label}</p>
    </div>
  );
}

export default function OverviewTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOverview().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-rose-dusty">{error}</p>;
  if (!data) return <p className="text-sm text-ink/40">Loading…</p>;

  const { stats, recentActivity } = data;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Readers" value={stats.totalUsers} />
        <StatCard label="Stories" value={stats.totalStories} />
        <StatCard label="Comments" value={stats.totalComments} />
        <StatCard label="Messages" value={stats.totalMessages} />
        <StatCard label="Total Views" value={stats.totalViews} />
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div>
          <h3 className="mb-3 font-display text-sm text-ink/70">Recent Readers</h3>
          <ul className="space-y-2 text-sm">
            {recentActivity.users.map((u) => (
              <li key={u.id} className="text-ink/70">
                {u.profile?.displayName || u.username}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm text-ink/70">Recent Stories</h3>
          <ul className="space-y-2 text-sm">
            {recentActivity.stories.map((s) => (
              <li key={s.id}>
                <Link to={`/stories/${s.slug}`} className="text-taupe-dark hover:underline">
                  {s.title}
                </Link>{" "}
                {!s.isPublished && <span className="text-xs text-ink/40">(draft)</span>}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm text-ink/70">Recent Comments</h3>
          <ul className="space-y-2 text-sm">
            {recentActivity.comments.map((c) => (
              <li key={c.id} className="text-ink/60">
                <span className="text-ink">{c.user.username}</span> on{" "}
                <Link to={`/stories/${c.story.slug}#comments`} className="text-taupe-dark hover:underline">
                  {c.story.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
