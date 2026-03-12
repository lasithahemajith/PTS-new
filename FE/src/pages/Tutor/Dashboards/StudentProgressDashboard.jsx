import React, { useEffect, useState, useMemo } from "react";
import API from "@/api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  RefreshCcw,
  Filter,
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

const STATUS_COLORS = {
  Pending: "#f97316",
  Verified: "#22c55e",
  Reviewed: "#4f46e5",
};

const ACTIVITY_COLORS = [
  "#4f46e5",
  "#22c55e",
  "#f97316",
  "#06b6d4",
  "#a855f7",
  "#f43f5e",
];

const TOP_STUDENTS_LIMIT = 10;

export default function StudentProgressDashboard() {
  const [rawData, setRawData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    minHours: "",
    minLogs: "",
    activity: "All",
    status: "All",
  });

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      ...filters,
      student: search,
    }).toString();
    try {
      const res = await API.get(`/dashboard/progress?${params}`);
      setRawData(res.data.data || []);
      setSummary(res.data.summary || {});
    } catch (err) {
      console.error("Error loading progress:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = () => fetchData();

  const chartData = useMemo(() => rawData.slice(0, TOP_STUDENTS_LIMIT), [rawData]);

  const statusData = useMemo(
    () =>
      [
        { name: "Pending", value: summary.totalPending || 0 },
        { name: "Verified", value: summary.totalVerified || 0 },
        { name: "Reviewed", value: summary.totalReviewed || 0 },
      ].filter((d) => d.value > 0),
    [summary]
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Students"
          value={summary.totalStudents || 0}
          icon={<Users size={18} />}
          color="indigo"
        />
        <StatCard
          label="Total Logs"
          value={summary.totalLogs || 0}
          icon={<BookOpen size={18} />}
          color="blue"
        />
        <StatCard
          label="Total Hours"
          value={`${summary.totalHours || 0}h`}
          icon={<Clock size={18} />}
          color="green"
        />
        <StatCard
          label="Avg Hours / Student"
          value={`${summary.avgHours || 0}h`}
          icon={<TrendingUp size={18} />}
          color="violet"
        />
        <StatCard
          label="Pending Logs"
          value={summary.totalPending || 0}
          icon={<AlertCircle size={18} />}
          color="orange"
        />
        <StatCard
          label="Verified / Reviewed"
          value={(summary.totalVerified || 0) + (summary.totalReviewed || 0)}
          icon={<CheckCircle2 size={18} />}
          color="teal"
        />
      </div>

      {/* Filter Panel */}
      <div className="bg-white shadow-sm rounded-2xl border border-indigo-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={15} className="text-indigo-500" />
          <h4 className="text-sm font-semibold text-gray-700">Filters</h4>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          {/* Student Search */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">
              Search Student
            </label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
              <Search size={13} className="text-gray-400" />
              <input
                type="text"
                placeholder="Student name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm outline-none w-36"
              />
            </div>
          </div>

          {/* Activity */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">
              Activity
            </label>
            <select
              value={filters.activity}
              onChange={(e) =>
                setFilters((p) => ({ ...p, activity: e.target.value }))
              }
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            >
              <option value="All">All Activities</option>
              <option value="Observation">Observation</option>
              <option value="Documentation">Documentation</option>
              <option value="Case Discussion">Case Discussion</option>
              <option value="Supervision">Supervision</option>
              <option value="Client Interaction">Client Interaction</option>
              <option value="Assessment">Assessment</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">
              Log Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((p) => ({ ...p, status: e.target.value }))
              }
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Reviewed">Reviewed</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">
              Date Range
            </label>
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-gray-400" />
              <input
                type="date"
                value={filters.from}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, from: e.target.value }))
                }
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={filters.to}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, to: e.target.value }))
                }
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Min Hours */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">
              Min Hours
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.minHours}
              onChange={(e) =>
                setFilters((p) => ({ ...p, minHours: e.target.value }))
              }
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none w-24"
            />
          </div>

          {/* Min Logs */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">
              Min Logs
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.minLogs}
              onChange={(e) =>
                setFilters((p) => ({ ...p, minLogs: e.target.value }))
              }
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none w-24"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              <RefreshCcw size={13} /> Refresh
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <RefreshCcw size={24} className="animate-spin mr-3" />
          <span className="text-sm font-medium">
            Loading student progress...
          </span>
        </div>
      ) : rawData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <GraduationCap size={48} className="mb-3 opacity-20" />
          <p className="text-sm font-medium">No student data found</p>
          <p className="text-xs mt-1">
            Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Grouped Bar: Logs + Attendance (top 10) */}
            <div className="lg:col-span-2 bg-white shadow-sm rounded-2xl border border-indigo-100 p-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">
                Top Students — Logs & Attendance Days
              </h4>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    barSize={14}
                    margin={{ top: 0, right: 10, left: -10, bottom: 40 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="logsSubmitted"
                      name="Logs Submitted"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="attendanceDays"
                      name="Attendance Days"
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut: Log Status Distribution */}
            <div className="bg-white shadow-sm rounded-2xl border border-indigo-100 p-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">
                Log Status Distribution
              </h4>
              <div className="h-[280px]">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                        innerRadius={55}
                        paddingAngle={3}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {statusData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={STATUS_COLORS[entry.name]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No data
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hours Bar Chart */}
          <div className="bg-white shadow-sm rounded-2xl border border-indigo-100 p-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              Top Students — Total Hours Logged
            </h4>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  barSize={24}
                  margin={{ top: 0, right: 10, left: -10, bottom: 40 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="totalHours"
                    name="Total Hours"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Table with expandable activity breakdown */}
          <div className="bg-white shadow-sm rounded-2xl border border-indigo-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h4 className="text-base font-semibold text-indigo-700">
                Individual Student Progress
              </h4>
              <span className="text-xs text-gray-400">
                {rawData.length} student(s) — click a row to view activity breakdown
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium w-8"></th>
                    <th className="px-4 py-3 text-left font-medium">
                      Student
                    </th>
                    <th className="px-4 py-3 text-center font-medium">Logs</th>
                    <th className="px-4 py-3 text-center font-medium">
                      Hours
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Attendance
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Pending
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Verified
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Reviewed
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Verified %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rawData.map((student, i) => {
                    const isExpanded = expandedStudent === student.name;
                    const verifiedPct =
                      student.logsSubmitted > 0
                        ? (
                            ((student.verifiedLogs + student.reviewedLogs) /
                              student.logsSubmitted) *
                            100
                          ).toFixed(0)
                        : 0;
                    return (
                      <React.Fragment key={i}>
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="hover:bg-indigo-50/30 transition cursor-pointer"
                          onClick={() =>
                            setExpandedStudent(
                              isExpanded ? null : student.name
                            )
                          }
                        >
                          <td className="px-4 py-3 text-gray-400">
                            {isExpanded ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {student.name}
                          </td>
                          <td className="px-4 py-3 text-center text-indigo-700 font-semibold">
                            {student.logsSubmitted}
                          </td>
                          <td className="px-4 py-3 text-center text-orange-600 font-semibold">
                            {student.totalHours}h
                          </td>
                          <td className="px-4 py-3 text-center text-green-600 font-semibold">
                            {student.attendanceDays}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                              {student.pendingLogs}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                              {student.verifiedLogs}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-600">
                              {student.reviewedLogs}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-20 h-2 rounded-full bg-gray-200 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    Number(verifiedPct) >= 75
                                      ? "bg-green-400"
                                      : Number(verifiedPct) >= 40
                                      ? "bg-yellow-400"
                                      : "bg-red-400"
                                  }`}
                                  style={{
                                    width: `${Math.min(verifiedPct, 100)}%`,
                                  }}
                                />
                              </div>
                              <span
                                className={`text-xs font-semibold ${
                                  Number(verifiedPct) >= 75
                                    ? "text-green-600"
                                    : Number(verifiedPct) >= 40
                                    ? "text-yellow-600"
                                    : "text-red-500"
                                }`}
                              >
                                {verifiedPct}%
                              </span>
                            </div>
                          </td>
                        </motion.tr>

                        {/* Expanded: Activity Breakdown */}
                        <AnimatePresence>
                          {isExpanded && (
                            <tr>
                              <td colSpan={9} className="px-0 py-0">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="bg-indigo-50/30 px-8 py-4 border-b border-indigo-100"
                                >
                                  <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                                    Activity Breakdown — {student.name}
                                  </p>
                                  {student.activitiesBreakdown &&
                                  student.activitiesBreakdown.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                      {/* Horizontal Bar Chart */}
                                      <div className="h-[180px]">
                                        <ResponsiveContainer
                                          width="100%"
                                          height="100%"
                                        >
                                          <BarChart
                                            data={student.activitiesBreakdown}
                                            layout="vertical"
                                            barSize={16}
                                            margin={{
                                              top: 0,
                                              right: 20,
                                              left: 90,
                                              bottom: 0,
                                            }}
                                          >
                                            <XAxis
                                              type="number"
                                              tick={{ fontSize: 11 }}
                                            />
                                            <YAxis
                                              type="category"
                                              dataKey="name"
                                              tick={{ fontSize: 11 }}
                                              width={90}
                                            />
                                            <Tooltip />
                                            <Bar
                                              dataKey="count"
                                              name="Logs"
                                              radius={[0, 4, 4, 0]}
                                            >
                                              {student.activitiesBreakdown.map(
                                                (_, j) => (
                                                  <Cell
                                                    key={j}
                                                    fill={
                                                      ACTIVITY_COLORS[
                                                        j %
                                                          ACTIVITY_COLORS.length
                                                      ]
                                                    }
                                                  />
                                                )
                                              )}
                                            </Bar>
                                          </BarChart>
                                        </ResponsiveContainer>
                                      </div>

                                      {/* Activity Donut */}
                                      <div className="h-[180px]">
                                        <ResponsiveContainer
                                          width="100%"
                                          height="100%"
                                        >
                                          <PieChart>
                                            <Pie
                                              data={
                                                student.activitiesBreakdown
                                              }
                                              dataKey="count"
                                              nameKey="name"
                                              outerRadius={70}
                                              innerRadius={35}
                                              paddingAngle={2}
                                            >
                                              {student.activitiesBreakdown.map(
                                                (_, j) => (
                                                  <Cell
                                                    key={j}
                                                    fill={
                                                      ACTIVITY_COLORS[
                                                        j %
                                                          ACTIVITY_COLORS.length
                                                      ]
                                                    }
                                                  />
                                                )
                                              )}
                                            </Pie>
                                            <Tooltip />
                                            <Legend
                                              wrapperStyle={{ fontSize: 11 }}
                                            />
                                          </PieChart>
                                        </ResponsiveContainer>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-400">
                                      No activity data available.
                                    </p>
                                  )}
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, icon, color }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    orange: "bg-orange-50 text-orange-500 border-orange-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100",
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

