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
import { Search, Calendar as CalendarIcon, PieChart as PieChartIcon, BarChart3 } from "lucide-react";

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

  /* ---------- Summary Cards ---------- */
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

  /* ---------- Chart Colors ---------- */
  const colors = ["#4ade80", "#f87171", "#60a5fa", "#facc15", "#a855f7"];

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 border border-indigo-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h3 className="text-xl font-semibold text-indigo-700 mb-3 md:mb-0">
          Attendance Overview by Student
        </h3>

        {/* Chart Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setChartType("bar")}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border ${
              chartType === "bar"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-indigo-50"
            }`}
          >
            <BarChart3 size={16} /> Bar
          </button>
          <button
            onClick={() => setChartType("pie")}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border ${
              chartType === "pie"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-indigo-50"
            }`}
          >
            <PieChartIcon size={16} /> Pie
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-indigo-50/40 p-4 rounded-lg border border-indigo-100 mb-6">
        <div className="flex items-center gap-2">
          <Search size={15} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-48 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Types</option>
          <option value="Class">Class</option>
          <option value="Practicum">Practicum</option>
        </select>

        <div className="flex items-center gap-2">
          <CalendarIcon size={15} className="text-gray-500" />
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm"
        >
          <p className="text-sm text-gray-500">Total Students</p>
          <h4 className="text-2xl font-bold text-indigo-700">{totalStudents}</h4>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm"
        >
          <p className="text-sm text-gray-500">Average Attendance</p>
          <h4 className="text-2xl font-bold text-green-700">
            {avgAttendance}%
          </h4>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm"
        >
          <p className="text-sm text-gray-500">Total Sessions</p>
          <h4 className="text-2xl font-bold text-blue-700">{totalSessions}</h4>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="w-full h-[360px]">
        {chartType === "bar" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attended" fill="#4ade80" name="Attended" />
              <Bar dataKey="missed" fill="#f87171" name="Missed" />
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
                outerRadius={120}
                label
              >
                {filteredData.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
