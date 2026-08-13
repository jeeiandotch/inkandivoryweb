import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { toggleCommentLike, deleteComment, editComment } from "../api/comments.js";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CommentItem({ comment, onReply, onChanged, depth = 0 }) {
  const { user, isStaff } = useAuth();
  const [liked, setLiked] = useState(comment.likedByViewer);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [busy, setBusy] = useState(false);

  const isOwn = user && user.id === comment.user.id;
  const canModerate = isOwn || isStaff;

  const handleLike = async () => {
    if (!user) return;
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      const result = await toggleCommentLike(comment.id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      setLiked((v) => !v); // revert on failure
    }
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setBusy(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText("");
      setReplying(false);
    } finally {
      setBusy(false);
    }
  };

  const submitEdit = async () => {
    if (!editText.trim()) return;
    setBusy(true);
    try {
      await editComment(comment.id, editText.trim());
      setEditing(false);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    setBusy(true);
    try {
      await deleteComment(comment.id);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={depth > 0 ? "ml-8 border-l border-ink/10 pl-4" : ""}>
      <div className="flex gap-3 py-3">
        <div className="mt-0.5 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-parchment">
          {comment.user.avatarUrl && (
            <img src={comment.user.avatarUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-ink">{comment.user.displayName || comment.user.username}</span>
            <span className="text-xs text-ink/40">{timeAgo(comment.createdAt)}</span>
          </div>

          {editing ? (
            <div className="mt-1.5">
              <textarea
                className="input-field text-sm"
                rows={2}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <div className="mt-1.5 flex gap-2">
                <button onClick={submitEdit} disabled={busy} className="text-xs text-taupe-dark hover:underline">
                  Save
                </button>
                <button onClick={() => setEditing(false)} className="text-xs text-ink/50 hover:underline">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className={`mt-0.5 text-sm ${comment.isDeleted ? "italic text-ink/40" : "text-ink/80"}`}>
              {comment.content}
            </p>
          )}

          {!comment.isDeleted && (
            <div className="mt-1.5 flex items-center gap-4 text-xs text-ink/50">
              <button onClick={handleLike} disabled={!user} className={liked ? "text-rose-dusty" : "hover:text-ink"}>
                ♡ {likeCount > 0 ? likeCount : ""}
              </button>
              {user && depth < 2 && (
                <button onClick={() => setReplying((v) => !v)} className="hover:text-ink">
                  Reply
                </button>
              )}
              {canModerate && !editing && (
                <>
                  {isOwn && (
                    <button onClick={() => setEditing(true)} className="hover:text-ink">
                      Edit
                    </button>
                  )}
                  <button onClick={handleDelete} disabled={busy} className="hover:text-rose-dusty">
                    Delete
                  </button>
                </>
              )}
            </div>
          )}

          {replying && (
            <div className="mt-2">
              <textarea
                className="input-field text-sm"
                rows={2}
                placeholder={`Reply to ${comment.user.displayName}…`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="mt-1.5 flex gap-2">
                <button onClick={submitReply} disabled={busy} className="text-xs text-taupe-dark hover:underline">
                  Post Reply
                </button>
                <button onClick={() => setReplying(false)} className="text-xs text-ink/50 hover:underline">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {comment.replies?.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} onChanged={onChanged} depth={depth + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
