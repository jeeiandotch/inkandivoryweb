import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import { fetchConversations } from "../../api/messages.js";
import ConversationList from "./ConversationList.jsx";
import ConversationThread from "./ConversationThread.jsx";

export default function MessengerWidget() {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  const load = useCallback(() => {
    fetchConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  // Close the dialog with Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Refresh the conversation list preview whenever any new message arrives,
  // so unread dots / last-message previews stay current even for threads
  // that aren't currently open.
  useEffect(() => {
    if (!socket) return;
    const handler = () => load();
    socket.on("message:new", handler);
    return () => socket.off("message:new", handler);
  }, [socket, load]);

  if (!isAuthenticated) return null;

  const unreadTotal = conversations.filter((c) => c.unread).length;

  return (
    <>
      {/* Floating icon */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open messages"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-ivory shadow-lift transition hover:bg-ink-light active:scale-95"
      >
        <QuillBubbleIcon />
        {unreadTotal > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-dusty px-1 text-[11px] font-medium text-white">
            {unreadTotal > 9 ? "9+" : unreadTotal}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Desktop popover */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Messages"
            className="fixed bottom-24 right-5 z-50 hidden h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-lift sm:flex animate-fade-in"
          >
            <PanelHeader onClose={() => setOpen(false)} />
            {active ? (
              <ConversationThread conversation={active} onBack={() => setActive(null)} />
            ) : (
              <ConversationList conversations={conversations} loading={loading} onSelect={setActive} />
            )}
          </div>

          {/* Mobile full-screen */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Messages"
            className="fixed inset-0 z-50 flex flex-col bg-white sm:hidden animate-fade-in"
          >
            <PanelHeader onClose={() => setOpen(false)} />
            {active ? (
              <ConversationThread conversation={active} onBack={() => setActive(null)} />
            ) : (
              <ConversationList conversations={conversations} loading={loading} onSelect={setActive} />
            )}
          </div>
        </>
      )}
    </>
  );
}

function PanelHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/10 bg-ivory px-4 py-3">
      <span className="font-script text-lg text-taupe-dark">Messages</span>
      <button onClick={onClose} aria-label="Close messages" className="text-ink/50 hover:text-ink">
        ✕
      </button>
    </div>
  );
}

// A quill nib forming a chat-bubble tail — matches the site's ink/quill motif
// instead of a generic speech-bubble icon.
function QuillBubbleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 12.5v-7Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 12.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M8 8.5 15 6l-2.5 5.5L8 8.5Z" fill="currentColor" />
    </svg>
  );
}
