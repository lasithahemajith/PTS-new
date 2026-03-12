import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  Calendar,
  Clock,
  FileText,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  X,
  Save,
  BarChart2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";

/* ── helpers ─────────────────────────────── */
const STATUS_STYLES = {
  Verified: { ring: "border-t-green-500",  badge: "bg-green-100 text-green-700" },
  Reviewed: { ring: "border-t-blue-500",   badge: "bg-blue-100  text-blue-700"  },
  Pending:  { ring: "border-t-yellow-400", badge: "bg-yellow-100 text-yellow-700" },
};

const ACTIVITY_COLORS = {
  Observation:        "bg-violet-100 text-violet-700",
  Documentation:      "bg-sky-100    text-sky-700",
  "Case Discussion":  "bg-pink-100   text-pink-700",
  Supervision:        "bg-teal-100   text-teal-700",
  "Client Interaction": "bg-orange-100 text-orange-700",
  Assessment:         "bg-rose-100   text-rose-700",
};

const ACTIVITY_ICONS = {
  Observation: "👁", Documentation: "📄", "Case Discussion": "💬",
  Supervision: "🎓", "Client Interaction": "🤝", Assessment: "📋",
};

export default function LogPaperList() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [activityFilter, setActivityFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);

  // Edit modal state
  const [editingLog, setEditingLog] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // ✅ Fetch logs
  const fetchLogs = async () => {
    try {
      const res = await API.get("/logpaper/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to load logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ✅ Apply filters
  useEffect(() => {
    let data = logs;

    if (statusFilter !== "All") {
      data = data.filter((log) => log.status === statusFilter);
    }

    if (activityFilter !== "All") {
      data = data.filter((log) => log.activity === activityFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (log) =>
          log.activity?.toLowerCase().includes(q) ||
          log.description?.toLowerCase().includes(q)
      );
    }

    if (fromDate) {
      data = data.filter((log) => new Date(log.date) >= new Date(fromDate));
    }

    if (toDate) {
      data = data.filter((log) => new Date(log.date) <= new Date(toDate));
    }

    setFilteredLogs(data);
    setPage(1);
  }, [statusFilter, activityFilter, searchQuery, fromDate, toDate, logs]);

  // ✅ Pagination logic
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredLogs.slice(start, start + perPage);
  }, [filteredLogs, page, perPage]);

  const totalPages = Math.ceil(filteredLogs.length / perPage);

  // ✅ Open edit modal
  const openEdit = (log, e) => {
    e.stopPropagation();
    const dateStr = log.date ? new Date(log.date).toISOString().split("T")[0] : "";
    setEditForm({
      date: dateStr,
      startTime: log.startTime || "",
      endTime: log.endTime || "",
      totalHours: log.totalHours || "",
      activity: log.activity || "",
      description: log.description || "",
    });
    setEditingLog(log);
  };

  const calculateHours = (start, end) => {
    if (!start || !end) return "";
    const s = new Date(`1970-01-01T${start}:00`);
    const en = new Date(`1970-01-01T${end}:00`);
    const diff = (en - s) / (1000 * 60 * 60);
    return diff > 0 ? diff.toFixed(2) : "";
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...editForm, [name]: value };
    if (name === "startTime" || name === "endTime") {
      updated.totalHours = calculateHours(updated.startTime, updated.endTime);
    }
    setEditForm(updated);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await API.put(`/logpaper/${editingLog._id}`, editForm);
      Swal.fire({ icon: "success", title: "Updated!", text: "Log updated successfully.", timer: 1800, showConfirmButton: false });
      setEditingLog(null);
      fetchLogs();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.error || "Failed to update log." });
    } finally {
      setEditLoading(false);
    }
  };

  // ✅ Delete handler
  const handleDelete = async (log, e) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: "Delete Log?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;
    try {
      await API.delete(`/logpaper/${log._id}`);
      Swal.fire({ icon: "success", title: "Deleted!", text: "Log deleted.", timer: 1500, showConfirmButton: false });
      fetchLogs();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.error || "Failed to delete log." });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-[80vh] text-red-600 font-medium">
        {error}
      </div>
    );

  /* ── quick stats ── */
  const totalLogs    = logs.length;
  const pendingCount = logs.filter((l) => l.status === "Pending").length;
  const verifiedCount= logs.filter((l) => l.status === "Verified").length;
  const totalHoursSum= logs.reduce((acc, l) => acc + (parseFloat(l.totalHours) || 0), 0);

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-[calc(100vh-90px)]">

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: <BarChart2  size={18} className="text-indigo-500" />, label: "Total Logs",    value: totalLogs,                   bg: "bg-indigo-50 border-indigo-200" },
          { icon: <AlertCircle size={18} className="text-yellow-500"/>, label: "Pending",        value: pendingCount,                 bg: "bg-yellow-50 border-yellow-200" },
          { icon: <CheckCircle2 size={18} className="text-green-500"/>, label: "Verified",       value: verifiedCount,                bg: "bg-green-50  border-green-200"  },
          { icon: <Clock size={18} className="text-sky-500" />,         label: "Total Hours",    value: totalHoursSum.toFixed(1)+"h", bg: "bg-sky-50    border-sky-200"    },
        ].map(({ icon, label, value, bg }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${bg}`}>
            {icon}
            <div>
              <p className="text-xs text-gray-500 font-medium leading-none">{label}</p>
              <p className="text-lg font-bold text-gray-800 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 border border-indigo-100 rounded-xl shadow-sm mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search logs…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-gray-50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-gray-50"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Reviewed">Reviewed</option>
        </select>

        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-gray-50"
        >
          <option value="All">All Activities</option>
          <option value="Observation">Observation</option>
          <option value="Documentation">Documentation</option>
          <option value="Case Discussion">Case Discussion</option>
          <option value="Supervision">Supervision</option>
          <option value="Client Interaction">Client Interaction</option>
          <option value="Assessment">Assessment</option>
        </select>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs text-gray-500 font-medium">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-gray-50"
          />
          <label className="text-xs text-gray-500 font-medium">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-gray-50"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-gray-50"
          >
            {[6, 9, 12].map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      </div>

      {/* ── Empty state ── */}
      {!filteredLogs.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <FileText size={52} className="mb-4 text-indigo-200" />
          <p className="text-lg font-semibold text-gray-500">No practicum logs found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or add a new log.</p>
        </div>
      ) : (
        <>
          {/* ── Logs grid ── */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {paginatedLogs.map((log) => {
              const st = STATUS_STYLES[log.status] || STATUS_STYLES.Pending;
              const actColor = ACTIVITY_COLORS[log.activity] || "bg-gray-100 text-gray-600";
              const actIcon  = ACTIVITY_ICONS[log.activity]  || "📝";
              return (
                <div
                  key={log._id}
                  onClick={() => navigate(`/student/logpapers/${log._id}`)}
                  className={`cursor-pointer bg-white border border-indigo-100 border-t-4 ${st.ring} rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col`}
                >
                  <div className="p-5 flex-1">
                    {/* Top row: activity badge + status badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${actColor}`}>
                        {actIcon} {log.activity || "Activity"}
                      </span>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${st.badge}`}>
                        {log.status}
                      </span>
                    </div>

                    {/* Date & hours */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Calendar size={13} />{new Date(log.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock size={13} />{log.totalHours ?? "-"}h</span>
                    </div>

                    {/* Description */}
                    {log.description && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {log.description.slice(0, 120)}{log.description.length > 120 && "…"}
                      </p>
                    )}

                    {/* Mentor comment snippet */}
                    {log.mentorComment && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 italic">
                          <span className="font-semibold not-italic text-blue-600">Mentor: </span>
                          {log.mentorComment.slice(0, 80)}{log.mentorComment.length > 80 && "…"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Edit/Delete footer for Pending */}
                  {log.status === "Pending" && (
                    <div className="flex gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                      <button
                        onClick={(e) => openEdit(log, e)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={(e) => handleDelete(log, e)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Pagination ── */}
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className={`p-2 rounded-lg border transition ${page === 1 ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200" : "bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-600 hover:text-white"}`}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-gray-600 font-medium px-2">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
              className={`p-2 rounded-lg border transition ${(page === totalPages || totalPages === 0) ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200" : "bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-600 hover:text-white"}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}

      {/* ── Edit Modal ── */}
      {editingLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 relative">
            <button
              onClick={() => setEditingLog(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-indigo-700 mb-5">✏️ Edit Practicum Log</h3>
            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" name="date" value={editForm.date} max={today} onChange={handleEditChange} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity</label>
                <select name="activity" value={editForm.activity} onChange={handleEditChange} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none">
                  <option value="">Select activity</option>
                  {["Observation","Documentation","Case Discussion","Supervision","Client Interaction","Assessment"].map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input type="time" name="startTime" value={editForm.startTime} onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input type="time" name="endTime" value={editForm.endTime} onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Hours</label>
                <input type="number" name="totalHours" value={editForm.totalHours} onChange={handleEditChange} placeholder="Auto-calculated"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} rows={3} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-y" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingLog(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading}
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60">
                  <Save size={15} />
                  {editLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
