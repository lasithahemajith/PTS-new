import React, { useEffect, useState, useCallback } from "react";
import API from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Search, RefreshCw } from "lucide-react";

const ACTION_LABELS = {
  LOGIN: "Login",
  CHANGE_PASSWORD: "Change Password",
  CREATE_LOG: "Submit Log",
  VERIFY_LOG: "Verify Log",
  REVIEW_LOG: "Review Log",
  SUBMIT_ATTENDANCE: "Submit Attendance",
  CREATE_USER: "Create User",
  MAP_MENTOR: "Map Mentor",
  UNMAP_MENTOR: "Unmap Mentor",
  RESET_PASSWORD: "Reset Password",
};

const ROLE_COLORS = {
  Student: "bg-blue-100 text-blue-700",
  Mentor: "bg-purple-100 text-purple-700",
  Tutor: "bg-indigo-100 text-indigo-700",
  System: "bg-gray-100 text-gray-600",
};

const ACTION_COLORS = {
  LOGIN: "bg-green-100 text-green-700",
  CHANGE_PASSWORD: "bg-yellow-100 text-yellow-700",
  CREATE_LOG: "bg-blue-100 text-blue-700",
  VERIFY_LOG: "bg-teal-100 text-teal-700",
  REVIEW_LOG: "bg-indigo-100 text-indigo-700",
  SUBMIT_ATTENDANCE: "bg-cyan-100 text-cyan-700",
  CREATE_USER: "bg-orange-100 text-orange-700",
  MAP_MENTOR: "bg-pink-100 text-pink-700",
  UNMAP_MENTOR: "bg-red-100 text-red-700",
  RESET_PASSWORD: "bg-rose-100 text-rose-700",
};

export default function AuditTrail() {
  const { token } = useAuth();

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters
  const [roleFilter, setRoleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 20 };
      if (roleFilter) params.role = roleFilter;
      if (actionFilter) params.action = actionFilter;
      if (search.trim()) params.search = search.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await API.get("/audit", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      console.error("Audit fetch error:", err);
      setError("Failed to load audit trail.");
    } finally {
      setLoading(false);
    }
  }, [token, page, roleFilter, actionFilter, search, startDate, endDate, refreshKey]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterApply = () => {
    setPage(1);
  };

  const handleReset = () => {
    setRoleFilter("");
    setActionFilter("");
    setSearch("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-indigo-100 rounded-xl shadow-inner">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
          🔍 Audit Trail
        </h2>
        <button
          onClick={() => { setPage(1); setRefreshKey((k) => k + 1); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition text-sm"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-indigo-100 rounded-xl shadow-sm p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {/* Search by name */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Roles</option>
            <option value="Student">Student</option>
            <option value="Mentor">Mentor</option>
            <option value="Tutor">Tutor</option>
          </select>

          {/* Action filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Actions</option>
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Start date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            title="Start Date"
          />

          {/* End date */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            title="End Date"
          />
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleFilterApply}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Apply Filters
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <p className="text-sm text-gray-500 mb-3">
        Showing <span className="font-semibold text-gray-700">{logs.length}</span> of{" "}
        <span className="font-semibold text-gray-700">{pagination.total}</span> entries
      </p>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-2xl border border-gray-200">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-indigo-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left whitespace-nowrap">Timestamp</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Resource</th>
                <th className="px-4 py-3 text-left">Details</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400 italic">
                    No audit logs found for the selected filters.
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr
                    key={log._id || i}
                    className="odd:bg-white even:bg-gray-50 hover:bg-indigo-50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {log.userName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          ROLE_COLORS[log.userRole] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {log.userRole}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">
                      {log.resource || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={log.details}>
                      {log.details || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {log.ipAddress || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            Page <span className="font-semibold">{pagination.page}</span> of{" "}
            <span className="font-semibold">{pagination.totalPages}</span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
