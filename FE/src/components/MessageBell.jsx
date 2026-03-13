import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchInbox, markMessageRead } from "@/api/messages";

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

const roleBadge = {
  Student: "bg-blue-100 text-blue-700",
  Mentor: "bg-green-100 text-green-700",
  Tutor: "bg-purple-100 text-purple-700",
};

export default function MessageBell() {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetchInbox();
      const all = res.data.messages || [];
      setMessages(all);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // silently fail – non-critical
    }
  }, []);

  useEffect(() => {
    loadMessages();

    const interval = setInterval(() => {
      if (!document.hidden) loadMessages();
    }, 30000);

    const handleVisibilityChange = () => {
      if (!document.hidden) loadMessages();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadMessages]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markMessageRead(id);
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, read: true } : m))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleClickMessage = async (msg) => {
    if (!msg.read) await handleMarkRead(msg._id);
    setOpen(false);
    navigate("/messages");
  };

  const unreadMessages = messages.filter((m) => !m.read).slice(0, 5);
  const displayMessages = unreadMessages.length > 0 ? unreadMessages : messages.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Icon button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-indigo-50 transition text-indigo-600"
        aria-label="Messages"
      >
        <MessageSquare size={22} />
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
            <span className="font-semibold text-indigo-800 text-sm">
              Messages
              {unreadCount > 0 && (
                <span className="ml-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </span>
          </div>

          {/* Message list */}
          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {displayMessages.length === 0 ? (
              <li className="px-4 py-6 text-center text-gray-400 text-sm">
                No messages yet
              </li>
            ) : (
              displayMessages.map((msg) => (
                <li
                  key={msg._id}
                  onClick={() => handleClickMessage(msg)}
                  className={`flex gap-3 px-4 py-3 cursor-pointer transition ${
                    msg.read ? "bg-white hover:bg-gray-50" : "bg-indigo-50 hover:bg-indigo-100"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-lg">✉️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p
                        className={`text-sm truncate ${
                          msg.read ? "text-gray-700" : "text-indigo-900 font-semibold"
                        }`}
                      >
                        {msg.subject}
                      </p>
                      {msg.sender?.role && (
                        <span
                          className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            roleBadge[msg.sender.role] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {msg.sender.role}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      From: {msg.sender?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(msg.createdAt)}</p>
                  </div>
                  {!msg.read && (
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                  )}
                </li>
              ))
            )}
          </ul>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => { setOpen(false); navigate("/messages"); }}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition w-full text-center"
            >
              View all messages →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
