import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  Download,
  Users,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react";

export default function MentorActivity() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [mentorFilter, setMentorFilter] = useState("");
  const [approvedFilter, setApprovedFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (mentorFilter.trim()) params.mentor = mentorFilter.trim();
      if (approvedFilter !== "All") params.approved = approvedFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      const res = await API.get("/dashboard/mentor-activity", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setSummary(res.data.summary || null);
      setData(res.data.data || []);
    } catch (err) {
      console.error("Error loading mentor activity:", err);
      setError("Failed to load mentor activity report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Filters are applied on-demand via the "Apply Filters" button, not automatically on change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const hasActiveFilters =
    mentorFilter.trim() !== "" ||
    approvedFilter !== "All" ||
    dateFrom !== "" ||
    dateTo !== "";

  const clearFilters = () => {
    setMentorFilter("");
    setApprovedFilter("All");
    setDateFrom("");
    setDateTo("");
  };

  const filtered = data.filter((m) => {
    const q = mentorFilter.trim().toLowerCase();
    if (q && !m.name.toLowerCase().includes(q)) return false;
    return true;
  });

  const toggleRow = (id) =>
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  // Export as CSV
  const handleExport = () => {
    const rows = [
      [
        "Mentor Name",
        "Email",
        "Phone",
        "Company",
        "Assigned Students",
        "Total Feedbacks",
        "Approved",
        "Pending",
        "Last Activity",
      ],
      ...filtered.map((m) => [
        m.name,
        m.email,
        m.phone || "",
        m.company || "",
        m.assignedStudents,
        m.totalFeedbacks,
        m.approvedFeedbacks,
        m.pendingFeedbacks,
        m.lastActivityDate
          ? new Date(m.lastActivityDate).toLocaleDateString()
          : "—",
      ]),
    ]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mentor_activity_report.csv";
    link.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 p-6">{error}</div>;
  }

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-indigo-100 rounded-xl shadow-inner">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
          🧑‍🏫 Mentor Activity Report
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm transition"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {[
            {
              icon: <Users size={20} className="text-indigo-500" />,
              label: "Total Mentors",
              value: summary.totalMentors,
              bg: "bg-indigo-50 border-indigo-200",
            },
            {
              icon: <Activity size={20} className="text-green-500" />,
              label: "Active Mentors",
              value: summary.activeMentors,
              bg: "bg-green-50 border-green-200",
            },
            {
              icon: <CheckCircle size={20} className="text-blue-500" />,
              label: "Total Feedbacks",
              value: summary.totalFeedbacks,
              bg: "bg-blue-50 border-blue-200",
            },
            {
              icon: <CheckCircle size={20} className="text-emerald-500" />,
              label: "Approved",
              value: summary.totalApproved,
              bg: "bg-emerald-50 border-emerald-200",
            },
            {
              icon: <Clock size={20} className="text-yellow-500" />,
              label: "Pending",
              value: summary.totalPending,
              bg: "bg-yellow-50 border-yellow-200",
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border shadow-sm ${card.bg}`}
            >
              {card.icon}
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {card.value}
              </p>
              <p className="text-xs text-gray-500 text-center mt-0.5">
                {card.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mb-5 bg-white p-4 rounded-lg shadow-sm border border-indigo-100 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
          <Filter size={15} />
          <span>Filters</span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition"
            >
              <X size={12} />
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Mentor Name */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Mentor name…"
              value={mentorFilter}
              onChange={(e) => setMentorFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Approved Status */}
          <select
            value={approvedFilter}
            onChange={(e) => setApprovedFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="All">All Approval Status</option>
            <option value="true">Approved</option>
            <option value="false">Pending Approval</option>
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              title="From date"
              className="flex-1 border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <span className="text-gray-400 text-xs">–</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              title="To date"
              className="flex-1 border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Apply Filters Button */}
          <button
            onClick={fetchData}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
          >
            Apply Filters
          </button>
        </div>

        {hasActiveFilters && (
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-indigo-700">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold">{data.length}</span> mentors
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-2xl border border-gray-200">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-indigo-700 text-white">
            <tr>
              <th className="px-4 py-3 text-left w-8"></th>
              <th className="px-4 py-3 text-left">Mentor</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-center">Assigned Students</th>
              <th className="px-4 py-3 text-center">Total Feedbacks</th>
              <th className="px-4 py-3 text-center">Approved</th>
              <th className="px-4 py-3 text-center">Pending</th>
              <th className="px-4 py-3 text-left">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-8 text-gray-500 italic"
                >
                  No mentor activity data found.
                </td>
              </tr>
            ) : (
              filtered.map((mentor, i) => (
                <React.Fragment key={mentor._id}>
                  {/* Mentor Row */}
                  <tr
                    className={`transition-all cursor-pointer ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-indigo-50`}
                    onClick={() =>
                      mentor.feedbacks.length > 0 && toggleRow(mentor._id)
                    }
                  >
                    <td className="px-4 py-3 text-gray-400">
                      {mentor.feedbacks.length > 0 ? (
                        expandedRows[mentor._id] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">
                        {mentor.name}
                      </p>
                      <p className="text-xs text-gray-500">{mentor.email}</p>
                      {mentor.phone && (
                        <p className="text-xs text-gray-400">{mentor.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {mentor.company || <span className="italic text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm">
                        {mentor.assignedStudents}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">
                      {mentor.totalFeedbacks}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        {mentor.approvedFeedbacks}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        {mentor.pendingFeedbacks}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {mentor.lastActivityDate ? (
                        new Date(mentor.lastActivityDate).toLocaleDateString()
                      ) : (
                        <span className="italic text-gray-400">No activity</span>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Feedback Details */}
                  {expandedRows[mentor._id] && mentor.feedbacks.length > 0 && (
                    <tr>
                      <td colSpan="8" className="bg-indigo-50 px-4 pb-4 pt-2">
                        <div className="ml-6">
                          <p className="text-xs font-semibold text-indigo-700 mb-2 uppercase tracking-wide">
                            Feedback Details
                          </p>
                          <div className="overflow-x-auto rounded-lg border border-indigo-100">
                            <table className="min-w-full text-xs text-gray-700 bg-white">
                              <thead className="bg-indigo-100 text-indigo-800">
                                <tr>
                                  <th className="px-3 py-2 text-left">
                                    Student
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Log Date
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Activity
                                  </th>
                                  <th className="px-3 py-2 text-center">
                                    Hours
                                  </th>
                                  <th className="px-3 py-2 text-center">
                                    Log Status
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Comment
                                  </th>
                                  <th className="px-3 py-2 text-center">
                                    Approved
                                  </th>
                                  <th className="px-3 py-2 text-left">
                                    Feedback Date
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {mentor.feedbacks.map((fb, j) => (
                                  <tr
                                    key={fb._id || j}
                                    className={
                                      j % 2 === 0 ? "bg-white" : "bg-indigo-50"
                                    }
                                  >
                                    <td className="px-3 py-2 font-medium">
                                      {fb.studentName}
                                      {fb.studentIndex !== "—" && (
                                        <span className="text-gray-400 ml-1">
                                          ({fb.studentIndex})
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2">
                                      {fb.logDate
                                        ? new Date(
                                            fb.logDate
                                          ).toLocaleDateString()
                                        : "—"}
                                    </td>
                                    <td className="px-3 py-2">
                                      {fb.logActivity}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      {fb.logHours ?? "—"}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                          fb.logStatus === "Verified"
                                            ? "bg-green-100 text-green-700"
                                            : fb.logStatus === "Reviewed"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}
                                      >
                                        {fb.logStatus}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 max-w-xs">
                                      <span
                                        className="block truncate"
                                        title={fb.comment}
                                      >
                                        {fb.comment}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      {fb.approved ? (
                                        <span className="text-green-600 font-semibold">
                                          ✓ Yes
                                        </span>
                                      ) : (
                                        <span className="text-yellow-600">
                                          Pending
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-gray-500">
                                      {fb.createdAt
                                        ? new Date(
                                            fb.createdAt
                                          ).toLocaleDateString()
                                        : "—"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
