import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Inbox,
  X,
  Users,
  User,
  PenSquare,
  ChevronDown,
  RefreshCw,
  Mail,
  MailOpen,
} from "lucide-react";
import API from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────────────────────
   Helper: relative time label
───────────────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

/* ─────────────────────────────────────────────────────────────
   Role badge colours
───────────────────────────────────────────────────────────── */
const roleBadge = {
  Student: "bg-blue-100 text-blue-700",
  Mentor: "bg-green-100 text-green-700",
  Tutor: "bg-purple-100 text-purple-700",
};

/* ─────────────────────────────────────────────────────────────
   CheckboxGroup – reusable section for Tutor multi-select
───────────────────────────────────────────────────────────── */
function CheckboxGroup({ group, selectedIds, onToggle }) {
  const allIds = group.users.map((u) => u._id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const someSelected = allIds.some((id) => selectedIds.includes(id));

  const handleToggleAll = () => {
    if (allSelected) {
      onToggle(allIds, false);
    } else {
      onToggle(allIds, true);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Group header with Select All */}
      <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1.5">
          <Users size={12} />
          {group.label}
          <span className="text-gray-400 font-normal">({group.users.length})</span>
        </span>
        {group.users.length > 0 && (
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-indigo-600 font-medium">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
              onChange={handleToggleAll}
              className="accent-indigo-600"
            />
            Select All
          </label>
        )}
      </div>

      {/* User list */}
      <div className="max-h-40 overflow-y-auto divide-y divide-gray-100">
        {group.users.length === 0 ? (
          <p className="px-3 py-3 text-sm text-gray-400 text-center">
            No {group.label.toLowerCase()} found
          </p>
        ) : (
          group.users.map((u) => (
            <label
              key={u._id}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-indigo-50 transition"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(u._id)}
                onChange={() => onToggle([u._id], !selectedIds.includes(u._id))}
                className="accent-indigo-600"
              />
              <span className="text-sm font-medium text-gray-700 flex-1 truncate">{u.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                  roleBadge[u.role] || "bg-gray-100 text-gray-600"
                }`}
              >
                {u.role}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPOSE MODAL
═══════════════════════════════════════════════════════════════ */
function ComposeModal({ onClose, onSent, groups, isTutor }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  // ── Tutor state: multi-group selection (both students and mentors) ──
  const [tutorSelectedIds, setTutorSelectedIds] = useState([]);

  // ── Non-tutor state: broadcast OR single-group individual pick ──
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [recipientMode, setRecipientMode] = useState(null); // "broadcast" | "individual"
  const [activeGroup, setActiveGroup] = useState(null);

  // ── Tutor helpers ──
  const handleTutorToggle = (ids, add) => {
    setTutorSelectedIds((prev) => {
      const set = new Set(prev);
      ids.forEach((id) => (add ? set.add(id) : set.delete(id)));
      return [...set];
    });
  };

  // ── Non-tutor helpers ──
  const handleGroupBtnClick = (group) => {
    if (group.type === "broadcast") {
      setRecipientMode("broadcast");
      setSelectedBroadcast(group.broadcastType);
      setSelectedIds([]);
      setActiveGroup(null);
    } else {
      setRecipientMode("individual");
      setSelectedBroadcast(null);
      setActiveGroup(group);
    }
  };

  const toggleUserId = (uid) => {
    setSelectedIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSend = async () => {
    if (!subject.trim()) return toast.error("Subject is required");
    if (!body.trim()) return toast.error("Message body is required");

    if (isTutor) {
      if (tutorSelectedIds.length === 0)
        return toast.error("Please select at least one recipient");
    } else {
      if (!recipientMode) return toast.error("Please select recipients");
      if (recipientMode === "individual" && selectedIds.length === 0)
        return toast.error("Please select at least one recipient");
    }

    setSending(true);
    try {
      const payload = { subject: subject.trim(), body: body.trim() };
      if (isTutor) {
        payload.recipientIds = tutorSelectedIds;
      } else if (recipientMode === "broadcast") {
        payload.broadcastType = selectedBroadcast;
      } else {
        payload.recipientIds = selectedIds;
      }
      await API.post("/messages", payload);
      toast.success("Message sent!");
      onSent();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const tutorTotal = tutorSelectedIds.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold">
            <PenSquare size={18} />
            Compose Message
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* ──── TUTOR: two checkbox-group sections ──── */}
          {isTutor ? (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                To
                {tutorTotal > 0 && (
                  <span className="ml-2 normal-case font-normal text-indigo-600">
                    {tutorTotal} recipient{tutorTotal !== 1 ? "s" : ""} selected
                  </span>
                )}
              </label>
              <div className="space-y-3">
                {groups.map((group) => (
                  <CheckboxGroup
                    key={group.label}
                    group={group}
                    selectedIds={tutorSelectedIds}
                    onToggle={handleTutorToggle}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* ──── STUDENT / MENTOR: broadcast or single-group pick ──── */
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                To
              </label>
              <div className="flex flex-wrap gap-2">
                {groups.map((group) => {
                  const isActive =
                    group.type === "broadcast"
                      ? recipientMode === "broadcast" && selectedBroadcast === group.broadcastType
                      : recipientMode === "individual" && activeGroup?.label === group.label;
                  return (
                    <button
                      key={group.label}
                      onClick={() => handleGroupBtnClick(group)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
                      }`}
                    >
                      {group.type === "broadcast" ? (
                        <Users size={14} />
                      ) : (
                        <User size={14} />
                      )}
                      {group.label}
                      {group.type === "broadcast" && (
                        <span className="ml-1 text-xs opacity-70">({group.users.length})</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Individual user picker */}
              <AnimatePresence>
                {recipientMode === "individual" && activeGroup && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Select from {activeGroup.label}
                    </div>
                    <div className="max-h-40 overflow-y-auto divide-y divide-gray-100">
                      {activeGroup.users.length === 0 ? (
                        <p className="px-3 py-3 text-sm text-gray-400 text-center">
                          No {activeGroup.label.toLowerCase()} assigned yet
                        </p>
                      ) : (
                        activeGroup.users.map((u) => (
                          <label
                            key={u._id}
                            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-indigo-50 transition"
                          >
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(u._id)}
                              onChange={() => toggleUserId(u._id)}
                              className="accent-indigo-600"
                            />
                            <span className="text-sm font-medium text-gray-700 flex-1">{u.name}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                roleBadge[u.role] || "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {u.role}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              placeholder="Enter subject…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={5000}
              rows={5}
              placeholder="Type your message…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-0.5">{body.length}/5000</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60"
          >
            {sending ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Send size={15} />
            )}
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MESSAGE DETAIL MODAL
═══════════════════════════════════════════════════════════════ */
function MessageDetail({ message, mode, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-base">
            <MailOpen size={18} />
            {message.subject}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            {mode === "inbox" ? (
              <span>
                <span className="font-medium text-gray-700">From:</span>{" "}
                {message.sender?.name}{" "}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    roleBadge[message.sender?.role] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {message.sender?.role}
                </span>
              </span>
            ) : (
              <span>
                <span className="font-medium text-gray-700">To:</span>{" "}
                {message.recipients
                  ?.map((r) => r.userId?.name)
                  .filter(Boolean)
                  .join(", ") || "—"}
              </span>
            )}
            <span className="ml-auto text-xs text-gray-400">
              {new Date(message.createdAt).toLocaleString()}
            </span>
          </div>

          {/* Body */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {message.body}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN MESSAGES PAGE
═══════════════════════════════════════════════════════════════ */
export default function MessagesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("inbox");
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedMode, setSelectedMode] = useState("inbox");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [inboxRes, sentRes, recipRes] = await Promise.all([
        API.get("/messages/inbox"),
        API.get("/messages/sent"),
        API.get("/messages/recipients"),
      ]);
      setInbox(inboxRes.data.messages || []);
      setSent(sentRes.data.messages || []);
      setGroups(recipRes.data.groups || []);
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenMessage = async (msg, mode) => {
    setSelectedMessage(msg);
    setSelectedMode(mode);

    if (mode === "inbox" && !msg.read) {
      try {
        await API.patch(`/messages/${msg._id}/read`);
        setInbox((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, read: true } : m))
        );
      } catch {
        // silently ignore
      }
    }
  };

  const unreadCount = inbox.filter((m) => !m.read).length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* Page Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white shadow-lg"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2">
                  <MessageSquare size={28} /> Messages
                </h2>
                <p className="text-indigo-100 text-sm md:text-base">
                  {user?.role === "Student" &&
                    "Send messages to your assigned mentor(s) or all tutors."}
                  {user?.role === "Mentor" &&
                    "Send messages to your assigned students or all tutors."}
                  {user?.role === "Tutor" &&
                    "Send messages to any combination of students and mentors."}
                </p>
              </div>
              <button
                onClick={() => setShowCompose(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-5 py-2.5 rounded-xl transition"
              >
                <PenSquare size={16} />
                Compose
              </button>
            </div>
          </motion.div>

          {/* Tabs + Refresh */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {[
                {
                  id: "inbox",
                  label: "Inbox",
                  icon: <Inbox size={15} />,
                  badge: unreadCount,
                },
                { id: "sent", label: "Sent", icon: <Send size={15} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Message List */}
          {loading ? (
            <div className="flex items-center gap-3 text-gray-400 py-10 justify-center">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-400" />
              Loading messages…
            </div>
          ) : (
            <MessageList
              messages={activeTab === "inbox" ? inbox : sent}
              mode={activeTab}
              onOpen={handleOpenMessage}
            />
          )}
        </main>

        <footer className="text-center py-4 text-indigo-500 text-xs opacity-70 border-t border-indigo-100">
          © 2025 EIT Practicum Tracker | Messages
        </footer>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <ComposeModal
            groups={groups}
            isTutor={user?.role === "Tutor"}
            onClose={() => setShowCompose(false)}
            onSent={fetchData}
          />
        )}
      </AnimatePresence>

      {/* Message Detail */}
      <AnimatePresence>
        {selectedMessage && (
          <MessageDetail
            message={selectedMessage}
            mode={selectedMode}
            onClose={() => setSelectedMessage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Message List Component
───────────────────────────────────────────────────────────── */
function MessageList({ messages, mode, onOpen }) {
  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-xl p-10 text-center border border-dashed border-indigo-200 text-gray-400">
        <Mail size={36} className="mx-auto mb-3 text-indigo-200" />
        <p className="font-medium">
          {mode === "inbox" ? "Your inbox is empty." : "No sent messages yet."}
        </p>
        <p className="text-sm mt-1">
          {mode === "inbox"
            ? "Messages from your assigned mentors/students/tutors will appear here."
            : "Messages you compose will appear here."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((msg, i) => (
        <motion.div
          key={msg._id}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onOpen(msg, mode)}
          className={`cursor-pointer bg-white rounded-xl px-5 py-4 flex items-start gap-4 shadow-sm border transition-all hover:shadow-md hover:border-indigo-200 ${
            mode === "inbox" && !msg.read ? "border-indigo-300 bg-indigo-50/50" : "border-gray-100"
          }`}
        >
          {/* Unread dot */}
          <div className="mt-1 flex-shrink-0">
            {mode === "inbox" ? (
              msg.read ? (
                <MailOpen size={18} className="text-gray-400" />
              ) : (
                <Mail size={18} className="text-indigo-600" />
              )
            ) : (
              <Send size={18} className="text-indigo-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-sm font-semibold text-gray-800 truncate">
                {mode === "inbox"
                  ? msg.sender?.name || "Unknown"
                  : `To: ${
                      msg.recipients
                        ?.map((r) => r.userId?.name)
                        .filter(Boolean)
                        .slice(0, 3)
                        .join(", ") +
                      (msg.recipients?.length > 3
                        ? ` +${msg.recipients.length - 3} more`
                        : "")
                    }`}
              </span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {timeAgo(msg.createdAt)}
              </span>
            </div>

            <p
              className={`text-sm truncate ${
                mode === "inbox" && !msg.read
                  ? "font-semibold text-indigo-800"
                  : "text-gray-700"
              }`}
            >
              {msg.subject}
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{msg.body}</p>
          </div>

          {/* Role badge (inbox only) */}
          {mode === "inbox" && msg.sender?.role && (
            <span
              className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${
                roleBadge[msg.sender.role] || "bg-gray-100 text-gray-600"
              }`}
            >
              {msg.sender.role}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
