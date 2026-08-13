import { useEffect, useState } from "react";
import { fetchAnnouncements } from "../api/announcements.js";
import EmptyState from "../components/EmptyState.jsx";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnnouncements().then(setAnnouncements).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
      <p className="mb-8 text-center font-script text-3xl text-taupe-dark">Announcements</p>

      {error && <p className="text-center text-sm text-rose-dusty">{error}</p>}

      {!announcements ? (
        <p className="text-center text-sm text-ink/40">Loading…</p>
      ) : announcements.length === 0 ? (
        <EmptyState title="No announcements yet" description="Updates from the writer will appear here." />
      ) : (
        <div className="flex flex-col gap-6">
          {announcements.map((a) => (
            <article key={a.id} className="card p-6">
              {a.isPinned && (
                <span className="mb-2 inline-block rounded-full bg-taupe/15 px-2.5 py-0.5 text-[11px] font-medium text-taupe-dark">
                  📌 Pinned
                </span>
              )}
              <h2 className="font-display text-xl text-ink">{a.title}</h2>
              <p className="mt-1 text-xs text-ink/40">
                {formatDate(a.createdAt)} · {a.author?.profile?.displayName || a.author?.username}
              </p>
              {a.imageUrl && (
                <img src={a.imageUrl} alt="" className="my-4 max-h-80 w-full rounded-xl object-cover" />
              )}
              <p className="mt-3 whitespace-pre-wrap font-serif text-ink/80">{a.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
