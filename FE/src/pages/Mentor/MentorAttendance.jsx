import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { motion } from "framer-motion";
import { CalendarDays, Search, Loader2 } from "lucide-react";

export default function MentorAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/attendance/mentor");
        setRecords(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error loading mentor attendance:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = records.filter((r) => {
    const matchesSearch =
      !search.trim() ||
      r.studentId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || r.attended === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const attendedCount = records.filter((r) => r.attended === "Yes").length;
  const absentCount = records.filter((r) => r.attended === "No").length;

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
          <CalendarDays size={22} className="text-indigo-600" />
          Attendance Overview
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Track practicum attendance for your assigned students.
        </p>
      </motion.div>

      {/* Summary Pills */}
      {!loading && records.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-5">
          <span className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700 font-medium">
            Total: {records.length}
          </span>
          <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-medium">
            Attended: {attendedCount}
          </span>
          <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 font-medium">
            Absent: {absentCount}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-64 shadow-sm">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none"
        >
          <option value="All">All Status</option>
          <option value="Yes">Attended</option>
          <option value="No">Absent</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <CalendarDays size={40} className="mb-3 text-indigo-200" />
            <p className="text-sm font-medium">
              {search.trim() || statusFilter !== "All"
                ? "No records match your filters."
                : "No attendance records found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-700 text-white text-left">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r._id || r.id || i}
                    className={`border-t transition-colors hover:bg-indigo-50 ${
                      r.attended === "Yes"
                        ? "even:bg-green-50"
                        : "even:bg-red-50"
                    } odd:bg-white`}
                  >
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs uppercase flex-shrink-0">
                          {r.studentId?.name?.charAt(0) || "?"}
                        </div>
                        <span className="font-medium text-gray-800">
                          {r.studentId?.name || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.studentId?.email || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          r.attended === "Yes"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.attended === "Yes" ? "Attended" : "Absent"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 italic text-xs">
                      {r.reason || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 text-right">
          Showing {filtered.length} of {records.length} record{records.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
