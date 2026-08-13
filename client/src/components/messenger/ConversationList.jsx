import { useState, useEffect, useRef } from "react";
import { searchUsers } from "../../api/users.js";
import { startConversation } from "../../api/messages.js";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function ConversationList({ conversations, onSelect, loading }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const users = await searchUsers(query.trim());
        setResults(users);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleStartConversation = async (username) => {
    const conversation = await startConversation(username);
    setQuery("");
    setResults([]);
    onSelect(conversation);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink/10 p-3">
        <input
          type="text"
          placeholder="Search people…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field !py-2 text-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {query.trim() ? (
          searching ? (
            <p className="p-4 text-center text-xs text-ink/40">Searching…</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-center text-xs text-ink/40">No users found.</p>
          ) : (
            results.map((u) => (
              <button
                key={u.id}
                onClick={() => handleStartConversation(u.username)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-parchment/50"
              >
                <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-parchment">
                  {u.avatarUrl && <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{u.displayName || u.username}</p>
                  <p className="truncate text-xs text-ink/40">@{u.username}</p>
                </div>
              </button>
            ))
          )
        ) : loading ? (
          <p className="p-4 text-center text-xs text-ink/40">Loading conversations…</p>
        ) : conversations.length === 0 ? (
          <p className="p-6 text-center text-xs text-ink/40">
            No conversations yet — search for someone above to say hello.
          </p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-parchment/50"
            >
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-parchment">
                {c.otherUser?.avatarUrl && (
                  <img src={c.otherUser.avatarUrl} alt="" className="h-full w-full object-cover" />
                )}
                {c.otherUser?.isOnline && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <p className={`truncate text-sm ${c.unread ? "font-semibold text-ink" : "text-ink/80"}`}>
                    {c.otherUser?.displayName || c.otherUser?.username}
                  </p>
                  {c.lastMessage && <span className="text-[10px] text-ink/35">{timeAgo(c.lastMessage.createdAt)}</span>}
                </div>
                <p className={`truncate text-xs ${c.unread ? "text-ink/70" : "text-ink/40"}`}>
                  {c.lastMessage?.content || "Say hello!"}
                </p>
              </div>
              {c.unread && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-taupe" />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
