import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/api/notifications";

const TYPE_ICON = {
  log_submitted: "📄",
  log_verified: "✅",
  log_reviewed: "💬",
  user_created: "👤",
  student_assigned: "🔗",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetchNotifications();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {
      // silently fail – notifications are non-critical
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    const startPolling = () => {
      const interval = setInterval(() => {
        if (!document.hidden) {
          loadNotifications();
        }
      }, 30000);
      return interval;
    };

    let interval = startPolling();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadNotifications();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-indigo-50 transition text-indigo-600"
        aria-label="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-indigo-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border-b border-indigo-100">
            <span className="font-semibold text-indigo-800 text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-gray-400 text-sm">
                No notifications yet
              </li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n._id}
                  onClick={() => !n.read && handleMarkRead(n._id)}
                  className={`flex gap-3 px-4 py-3 cursor-pointer transition ${
                    n.read ? "bg-white" : "bg-indigo-50 hover:bg-indigo-100"
                  }`}
                >
                  <span className="text-lg mt-0.5">{TYPE_ICON[n.type] || "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug break-words ${
                        n.read ? "text-gray-600" : "text-indigo-900 font-medium"
                      }`}
                    >
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
