import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCommentsAdmin, deleteCommentAdmin } from "../../api/admin.js";

export default function CommentsModerationTab() {
  const [comments, setComments] = useState(null);
  const [error, setError] = useState("");

  const load = () => fetchCommentsAdmin().then(setComments).catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (c) => {
    if (!window.confirm("Delete this comment?")) return;
    await deleteCommentAdmin(c.id);
    load();
  };

  return (
    <div>
      <h2 className="mb-5 font-display text-lg text-ink">Moderate Comments</h2>
      {error && <p className="text-sm text-rose-dusty">{error}</p>}
      {!comments ? (
        <p className="text-sm text-ink/40">Loading…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink/40">No comments yet.</p>
      ) : (
        <div className="divide-y divide-ink/5 rounded-2xl border border-ink/10">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-sm text-ink/80">{c.content}</p>
                <p className="mt-1 text-xs text-ink/40">
                  {c.user.username} on{" "}
                  <Link to={`/stories/${c.story.slug}#comments`} className="text-taupe-dark hover:underline">
                    {c.story.title}
                  </Link>
                </p>
              </div>
              <button onClick={() => handleDelete(c)} className="flex-shrink-0 text-xs text-rose-dusty hover:underline">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
