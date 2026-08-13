import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import { fetchMessages, sendMessage, markConversationRead } from "../../api/messages.js";

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function ConversationThread({ conversation, onBack }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMessages(conversation.id)
      .then((msgs) => !cancelled && setMessages(msgs))
      .finally(() => !cancelled && setLoading(false));
    markConversationRead(conversation.id).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [conversation.id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("conversation:join", conversation.id);

    const handler = (msg) => {
      if (msg.conversationId !== conversation.id) return;
      setMessages((prev) => [...prev, msg]);
      if (msg.senderId !== user.id) markConversationRead(conversation.id).catch(() => {});
    };
    socket.on("message:new", handler);

    return () => {
      socket.emit("conversation:leave", conversation.id);
      socket.off("message:new", handler);
    };
  }, [socket, conversation.id, user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText("");
    setSending(true);
    try {
      const message = await sendMessage(conversation.id, content);
      // Only append locally if the socket echo hasn't already added it
      // (covers the case where the socket connection dropped momentarily).
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-ink/10 p-3">
        <button onClick={onBack} className="text-ink/60 hover:text-ink" aria-label="Back to conversations">
          ←
        </button>
        <div className="h-8 w-8 overflow-hidden rounded-full bg-parchment">
          {conversation.otherUser?.avatarUrl && (
            <img src={conversation.otherUser.avatarUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-ink">{conversation.otherUser?.displayName || conversation.otherUser?.username}</p>
          <p className="text-xs text-ink/40">{conversation.otherUser?.isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {loading ? (
          <p className="text-center text-xs text-ink/40">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="mt-6 text-center text-xs text-ink/40">This is the start of your conversation.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {messages.map((m) => {
              const isOwn = m.senderId === user.id;
              return (
                <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                      isOwn ? "bg-ink text-ivory" : "bg-parchment text-ink"
                    }`}
                  >
                    {m.content}
                    <div className={`mt-0.5 text-[10px] ${isOwn ? "text-ivory/50" : "text-ink/35"}`}>
                      {formatTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-ink/10 p-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message…"
          maxLength={4000}
          className="input-field !py-2 flex-1 text-sm"
        />
        <button type="submit" disabled={!text.trim() || sending} className="btn-primary !py-2 !px-4 text-xs disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}
