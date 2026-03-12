import React, { useEffect, useState, useMemo } from "react";
import API from "@/api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import {
  Search,
  Calendar as CalendarIcon,
  PieChart as PieChartIcon,
  BarChart3,
  Users,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function AttendanceDashboard() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [chartType, setChartType] = useState("bar");

  useEffect(() => {
    API.get("/dashboard/attendance").then((res) => setData(res.data || []));
  }, []);

  /* ---------- Derived Data ---------- */
  const filteredData = useMemo(() => {
    let result = data;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }

    if (typeFilter !== "All") {
      result = result.filter((d) => d.type === typeFilter);
    }

    if (fromDate) {
      result = result.filter(
        (d) => new Date(d.date) >= new Date(fromDate)
      );
    }

    if (toDate) {
      result = result.filter(
        (d) => new Date(d.date) <= new Date(toDate)
      );
    }

    return result;
  }, [data, search, typeFilter, fromDate, toDate]);

  /* ---------- Summary ---------- */
  const totalStudents = filteredData.length;
  const avgAttendance =
    totalStudents > 0
      ? (
          filteredData.reduce((sum, d) => sum + Number(d.attendanceRate || 0), 0) /
          totalStudents
        ).toFixed(1)
      : 0;

  const totalSessions = filteredData.reduce(
    (sum, d) => sum + (d.attended + d.missed),
    0
  );

  const atRiskCount = filteredData.filter(
    (d) => Number(d.attendanceRate || 0) < 75
  ).length;

  /* ---------- Chart Colors ---------- */
  const colors = ["#4ade80", "#f87171", "#60a5fa", "#facc15", "#a855f7"];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={totalStudents}
          icon={<Users size={18} />}
          color="indigo"
        />
        <StatCard
          label="Avg Attendance"
          value={`${avgAttendance}%`}
          icon={<TrendingUp size={18} />}
          color="green"
        />
        <StatCard
          label="Total Sessions"
          value={totalSessions}
          icon={<CheckCircle2 size={18} />}
          color="blue"
        />
        <StatCard
          label="At Risk (<75%)"
          value={atRiskCount}
          icon={<AlertCircle size={18} />}
          color={atRiskCount > 0 ? "red" : "gray"}
        />
      </div>

      {/* Chart Panel */}
      <div className="bg-white shadow-md rounded-2xl p-6 border border-indigo-100">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h3 className="text-lg font-semibold text-indigo-700">
            Attendance by Student
          </h3>

          {/* Chart Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setChartType("bar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition ${
                chartType === "bar"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-indigo-50 hover:border-indigo-200"
              }`}
            >
              <BarChart3 size={15} /> Bar
            </button>
            <button
              onClick={() => setChartType("pie")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition ${
                chartType === "pie"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-indigo-50 hover:border-indigo-200"
              }`}
            >
              <PieChartIcon size={15} /> Pie
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 w-44 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Class">Class</option>
            <option value="Practicum">Practicum</option>
          </select>

          <div className="flex items-center gap-2">
            <CalendarIcon size={14} className="text-gray-400" />
            <label className="text-xs text-gray-500 font-medium">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
            <label className="text-xs text-gray-500 font-medium">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Chart */}
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <BarChart3 size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No attendance data to display</p>
            <p className="text-xs mt-1">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="w-full h-[340px]">
            {chartType === "bar" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData} barSize={24}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attended" fill="#4ade80" name="Attended" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="missed" fill="#f87171" name="Missed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredData.map((d) => ({
                      name: d.name,
                      value: Number(d.attendanceRate),
                    }))}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={130}
                    innerRadius={50}
                    label={({ value }) => `${value}%`}
                    labelLine={false}
                  >
                    {filteredData.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Student Table */}
      {filteredData.length > 0 && (
        <div className="bg-white shadow-md rounded-2xl border border-indigo-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-indigo-700">Student Attendance Details</h3>
            <span className="text-xs text-gray-400">{filteredData.length} student(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-center font-medium">Attended</th>
                  <th className="px-4 py-3 text-center font-medium">Missed</th>
                  <th className="px-4 py-3 text-center font-medium">Total</th>
                  <th className="px-4 py-3 text-center font-medium">Rate</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((row, i) => {
                  const rate = Number(row.attendanceRate || 0);
                  const total = row.attended + row.missed;
                  const isAtRisk = rate < 75;
                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-indigo-50/40 transition"
                    >
                      <td className="px-6 py-3 font-medium text-gray-800">{row.name}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{row.attended}</td>
                      <td className="px-4 py-3 text-center text-red-500 font-semibold">{row.missed}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{total}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${rate >= 75 ? "bg-green-400" : "bg-red-400"}`}
                              style={{ width: `${Math.min(rate, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${rate >= 75 ? "text-green-700" : "text-red-600"}`}>
                            {rate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isAtRisk
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {isAtRisk ? "At Risk" : "Good"}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, icon, color }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    green: "bg-green-50 text-green-600 border-green-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    red: "bg-red-50 text-red-500 border-red-100",
    gray: "bg-gray-50 text-gray-500 border-gray-100",
  };
  const cls = colorMap[color] || colorMap.indigo;
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`flex items-center gap-3 p-4 rounded-xl border shadow-sm ${cls}`}
    >
      <div className="p-2 bg-white/60 rounded-lg">{icon}</div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-gray-500 leading-tight">{label}</p>
      </div>
    </motion.div>
  );
}
