import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStoriesAdmin } from "../../api/admin.js";
import { updateStory, deleteStory } from "../../api/stories.js";

export default function StoriesTab() {
  const [stories, setStories] = useState(null);
  const [error, setError] = useState("");

  const load = () => fetchStoriesAdmin().then(setStories).catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const handleTogglePublish = async (story) => {
    await updateStory(story.id, { isPublished: !story.isPublished });
    load();
  };

  const handleDelete = async (story) => {
    if (!window.confirm(`Delete "${story.title}"? This cannot be undone.`)) return;
    await deleteStory(story.id);
    load();
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">Manage Stories</h2>
        <Link to="/dashboard/stories/new" className="btn-primary !py-2 !px-4 text-xs">
          + New Story
        </Link>
      </div>

      {error && <p className="text-sm text-rose-dusty">{error}</p>}

      {!stories ? (
        <p className="text-sm text-ink/40">Loading…</p>
      ) : stories.length === 0 ? (
        <p className="text-sm text-ink/40">No stories yet — create your first one.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink/10">
          <table className="w-full text-sm">
            <thead className="bg-parchment/60 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Chapters</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {stories.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <Link to={`/stories/${s.slug}`} className="text-ink hover:text-taupe-dark">
                      {s.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/60">{s.status}</td>
                  <td className="px-4 py-3 text-ink/60">{s._count.chapters}</td>
                  <td className="px-4 py-3 text-ink/60">{s.viewCount}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublish(s)}
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        s.isPublished ? "bg-taupe/15 text-taupe-dark" : "bg-ink/10 text-ink/50"
                      }`}
                    >
                      {s.isPublished ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="space-x-3 px-4 py-3 text-right">
                    <Link to={`/dashboard/stories/${s.id}/edit`} className="text-xs text-taupe-dark hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(s)} className="text-xs text-rose-dusty hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
