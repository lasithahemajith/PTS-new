import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { useNavigate } from "react-router-dom";

export default function MentorReports() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const tabs = ["Pending", "Verified", "All"];

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

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 py-1 rounded-lg text-sm ${
              activeTab === t
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name or index…"
          className="ml-auto border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-64"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Index</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Activity</th>
              <th className="p-3 text-left">Hours</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan={7}>
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-4 text-gray-500" colSpan={7}>
                  {search.trim()
                    ? "No logs match your search."
                    : "No logs in this tab."}
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log._id} className="border-t">
                  <td className="p-3">{log.studentId?.name || "—"}</td>
                  <td className="p-3">{log.studentId?.studentIndex || "—"}</td>
                  <td className="p-3">
                    {new Date(log.date).toLocaleDateString()}
                  </td>
                  <td className="p-3">{log.activity}</td>
                  <td className="p-3">{log.totalHours ?? log.hours ?? "-"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        log.status === "Verified"
                          ? "text-green-700 bg-green-100"
                          : log.status === "Pending"
                          ? "text-yellow-700 bg-yellow-100"
                          : "text-gray-700 bg-gray-100"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => navigate(`/mentor/reports/${log._id}`)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
