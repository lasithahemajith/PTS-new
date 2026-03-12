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
} from "lucide-react";
import Swal from "sweetalert2";

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

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-[calc(100vh-90px)] rounded-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-indigo-800 tracking-tight">
          🗂 My Practicum Logs
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 border border-indigo-100 rounded-xl shadow-sm mb-6">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-48 focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Reviewed">Reviewed</option>
        </select>

        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Activities</option>
          <option value="Observation">Observation</option>
          <option value="Documentation">Documentation</option>
          <option value="Case Discussion">Case Discussion</option>
          <option value="Supervision">Supervision</option>
          <option value="Client Interaction">Client Interaction</option>
          <option value="Assessment">Assessment</option>
        </select>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <label className="text-sm text-gray-600 font-medium">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Filter className="text-gray-500" size={18} />
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            {[6, 9, 12].map((num) => (
              <option key={num} value={num}>
                {num} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* No Logs */}
      {!filteredLogs.length ? (
        <div className="text-center text-gray-600 mt-20">
          <FileText className="mx-auto mb-3 text-gray-400" size={40} />
          <p>No practicum logs found.</p>
        </div>
      ) : (
        <>
          {/* Logs Grid */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {paginatedLogs.map((log) => (
              <div
                key={log._id}
                onClick={() => navigate(`/student/logpapers/${log._id}`)}
                className="cursor-pointer bg-white border border-indigo-100 p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-700">
                      {log.activity || "Untitled Activity"}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar size={15} />{" "}
                      {new Date(log.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Clock size={15} /> {log.totalHours ?? "-"} hours
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      log.status === "Verified"
                        ? "bg-green-100 text-green-700"
                        : log.status === "Reviewed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {log.status}
                  </span>
                </div>

                {log.description && (
                  <p className="text-gray-700 text-sm mt-2 leading-snug line-clamp-3">
                    {log.description.slice(0, 120)}
                    {log.description.length > 120 && "…"}
                  </p>
                )}

                {log.mentorComment && (
                  <>
                    <div className="border-t border-gray-200 my-3"></div>
                    <p className="text-sm text-gray-700 italic">
                      <strong>Mentor:</strong>{" "}
                      {log.mentorComment.length > 90
                        ? `${log.mentorComment.slice(0, 90)}…`
                        : log.mentorComment}
                    </p>
                  </>
                )}

                {log.tutorFeedback && (
                  <>
                    <div className="border-t border-gray-100 mt-3 mb-2"></div>
                    <p className="text-sm text-gray-700 italic">
                      <strong>Tutor:</strong>{" "}
                      {log.tutorFeedback.length > 90
                        ? `${log.tutorFeedback.slice(0, 90)}…`
                        : log.tutorFeedback}
                    </p>
                  </>
                )}

                {/* Edit/Delete buttons for Pending logs */}
                {log.status === "Pending" && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => openEdit(log, e)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(log, e)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-2 rounded-md border ${
                page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              } transition`}
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm text-gray-700 font-medium">
              Page {page} of {totalPages || 1}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-3 py-2 rounded-md border ${
                page === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              } transition`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}

      {/* Edit Modal */}
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
                <input
                  type="date"
                  name="date"
                  value={editForm.date}
                  max={today}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity</label>
                <select
                  name="activity"
                  value={editForm.activity}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                >
                  <option value="">Select activity</option>
                  <option value="Observation">Observation</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Case Discussion">Case Discussion</option>
                  <option value="Supervision">Supervision</option>
                  <option value="Client Interaction">Client Interaction</option>
                  <option value="Assessment">Assessment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={editForm.startTime}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={editForm.endTime}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Hours</label>
                <input
                  type="number"
                  name="totalHours"
                  value={editForm.totalHours}
                  onChange={handleEditChange}
                  placeholder="Auto-calculated"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={3}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-y"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
                >
                  <Save size={15} />
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
