import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPublicProfile, toggleBlockUser } from "../api/users.js";
import { startConversation } from "../api/messages.js";
import { useAuth } from "../context/AuthContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

export default function Profile() {
  const { username } = useParams();
  const { user: viewer } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [messaging, setMessaging] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    fetchPublicProfile(username)
      .then(setProfile)
      .catch((err) => setError(err.message));
  }, [username]);

  const handleMessage = async () => {
    setMessaging(true);
    try {
      const conversation = await startConversation(username);
      window.dispatchEvent(new CustomEvent("ii:open-conversation", { detail: conversation }));
    } catch (err) {
      setError(err.message);
    } finally {
      setMessaging(false);
    }
  };

  const handleBlock = async () => {
    const result = await toggleBlockUser(username);
    setBlocked(result.blocked);
  };

  if (error) return <EmptyState title="Profile not found" description={error} />;
  if (!profile) return <div className="px-5 py-16 text-center text-sm text-ink/40">Loading…</div>;

  const isSelf = viewer?.username === username;

  return (
    <div className="mx-auto max-w-xl px-5 py-14 text-center sm:px-8">
      <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-parchment shadow-soft">
        {profile.avatarUrl && <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />}
      </div>
      <p className="font-script text-2xl text-taupe-dark">{profile.displayName || profile.username}</p>
      <p className="text-sm text-ink/40">@{profile.username}</p>
      {profile.role !== "READER" && (
        <span className="mt-1 inline-block rounded-full bg-taupe/15 px-2.5 py-0.5 text-[11px] text-taupe-dark">
          {profile.role === "OWNER" ? "Writer" : "Staff"}
        </span>
      )}

      {profile.bio && <p className="mx-auto mt-4 max-w-sm text-sm text-ink/70">{profile.bio}</p>}
      <p className="mt-2 text-xs text-ink/40">Joined {formatDate(profile.joinedAt)}</p>

      {!isSelf && viewer && (
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={handleMessage} disabled={messaging} className="btn-primary !py-2 !px-5 text-xs disabled:opacity-50">
            {messaging ? "Opening…" : "Message"}
          </button>
          <button onClick={handleBlock} className="btn-secondary !py-2 !px-5 text-xs">
            {blocked ? "Unblock" : "Block"}
          </button>
        </div>
      )}

      {isSelf && (
        <div className="mt-6">
          <Link to="/settings" className="btn-secondary !py-2 !px-5 text-xs">
            Edit Profile
          </Link>
        </div>
      )}
    </div>
  );
}
