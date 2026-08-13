import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchComments, postComment } from "../api/comments.js";
import CommentItem from "./CommentItem.jsx";
import EmptyState from "./EmptyState.jsx";
import { Link } from "react-router-dom";

export default function CommentSection({ storyId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const results = await fetchComments(storyId);
      setComments(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    setError("");
    try {
      await postComment(storyId, { content: text.trim() });
      setText("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (parentId, content) => {
    await postComment(storyId, { content, parentId });
    await load();
  };

  return (
    <section id="comments" className="mx-auto max-w-2xl px-5 py-10">
      <h2 className="mb-5 font-display text-xl text-ink">
        Comments {comments.length > 0 && <span className="text-ink/40">({comments.length})</span>}
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            className="input-field text-sm"
            rows={3}
            placeholder="Share your thoughts…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
          />
          {error && <p className="mt-2 text-sm text-rose-dusty">{error}</p>}
          <div className="mt-2 flex justify-end">
            <button type="submit" disabled={posting || !text.trim()} className="btn-primary !py-2 !px-5 text-xs disabled:opacity-50">
              {posting ? "Posting…" : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-8 rounded-xl border border-ink/10 bg-parchment/50 px-4 py-3 text-sm text-ink/60">
          <Link to="/login" className="text-taupe-dark underline">Log in</Link> to join the conversation.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink/40">Loading comments…</p>
      ) : comments.length === 0 ? (
        <EmptyState icon="💬" title="No comments yet" description="Be the first to share your thoughts." />
      ) : (
        <div className="divide-y divide-ink/5">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} onReply={handleReply} onChanged={load} />
          ))}
        </div>
      )}
    </section>
  );
}
