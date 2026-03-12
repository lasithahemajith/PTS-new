import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, FileText, Loader2 } from "lucide-react";

const STATUS_TABS = ["Pending", "Verified", "All"];

export default function MentorReports() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await API.get("/logpaper/mentor/reports");
        if (mounted) setLogs(data || []);
      } catch (err) {
        console.error("Error loading mentor logs:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = logs.filter((l) => {
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Pending" && l.status === "Pending") ||
      (activeTab === "Verified" && l.status === "Verified");

    const studentName = l.studentId?.name || "";
    const studentIndex = l.studentId?.studentIndex || "";
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      studentName.toLowerCase().includes(q) ||
      studentIndex.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  const pendingCount = logs.filter((l) => l.status === "Pending").length;
  const verifiedCount = logs.filter((l) => l.status === "Verified").length;

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 min-h-screen">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
          <FileText size={22} className="text-indigo-600" />
          Log Reports
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Review and verify practicum logs submitted by your assigned students.
        </p>
      </motion.div>

      {/* Tabs + Search Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-2">
          {STATUS_TABS.map((t) => {
            const count =
              t === "Pending"
                ? pendingCount
                : t === "Verified"
                ? verifiedCount
                : logs.length;
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  activeTab === t
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {t}
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 ${
                    activeTab === t
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 w-full sm:w-72 shadow-sm">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or index…"
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-indigo-700 text-white text-left">
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Index</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3">Hours</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-8 text-center" colSpan={7}>
                  <div className="flex justify-center">
                    <Loader2 className="animate-spin text-indigo-500" size={28} />
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-8 text-center text-gray-400 italic" colSpan={7}>
                  {search.trim()
                    ? "No logs match your search."
                    : "No logs in this tab."}
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr
                  key={log._id}
                  className={`border-t transition-colors ${
                    log.status === "Verified"
                      ? "bg-green-50 hover:bg-green-100"
                      : "odd:bg-white even:bg-gray-50 hover:bg-indigo-50"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {log.studentId?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {log.studentId?.studentIndex || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(log.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{log.activity}</td>
                  <td className="px-4 py-3">{log.totalHours ?? log.hours ?? "-"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/mentor/reports/${log._id}`)}
                      className={`text-sm font-semibold transition ${
                        log.status === "Pending"
                          ? "text-amber-600 hover:text-amber-800"
                          : "text-indigo-600 hover:text-indigo-800"
                      }`}
                    >
                      {log.status === "Pending" ? "Verify Now" : "View"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 text-right">
          Showing {filtered.length} of {logs.length} log{logs.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles =
    status === "Verified"
      ? "bg-green-100 text-green-700"
      : status === "Pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-gray-100 text-gray-600";
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
}
