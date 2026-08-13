import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../api/notifications.js";
import EmptyState from "./EmptyState.jsx";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wrapperRef = useRef(null);

  const load = () => {
    fetchNotifications()
      .then(({ notifications, unreadCount }) => {
        setNotifications(notifications);
        setUnreadCount(unreadCount);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;
    const handler = (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((c) => c + 1);
    };
    socket.on("notification:new", handler);
    return () => socket.off("notification:new", handler);
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => setOpen((v) => !v);

  const handleMarkOne = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/70 hover:text-ink"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-dusty px-1 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 animate-fade-in overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-lift">
          <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
            <span className="font-display text-sm text-ink">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} className="text-xs text-taupe-dark hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <EmptyState icon="🔔" title="No notifications" description="You're all caught up." />
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  to={n.link || "#"}
                  onClick={() => {
                    if (!n.isRead) handleMarkOne(n.id);
                    setOpen(false);
                  }}
                  className={`block border-b border-ink/5 px-4 py-3 text-sm transition hover:bg-parchment/50 ${
                    n.isRead ? "text-ink/60" : "bg-taupe/5 text-ink"
                  }`}
                >
                  <p>{n.message}</p>
                  <p className="mt-0.5 text-xs text-ink/40">{timeAgo(n.createdAt)}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
