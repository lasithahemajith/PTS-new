import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Filter, Calendar, RefreshCcw } from "lucide-react";

export default function StudentProgressDashboard() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    minHours: "",
    minLogs: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams(filters).toString();
    try {
      const res = await API.get(`/dashboard/progress?${params}`);
      setData(res.data.data || []);
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

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    fetchData();
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 border border-indigo-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h3 className="text-xl font-semibold text-indigo-700">
          👩‍🎓 Student Progress Tracker
        </h3>
        <button
          onClick={fetchData}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition"
        >
          <RefreshCcw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-indigo-50/40 p-4 rounded-lg border border-indigo-100 mb-6 flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-indigo-600" />
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-gray-500" />
          <label className="text-sm text-gray-600 font-medium">From</label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => handleChange("from", e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <label className="text-sm text-gray-600 font-medium">To</label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => handleChange("to", e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <input
          type="number"
          placeholder="Min Hours"
          value={filters.minHours}
          onChange={(e) => handleChange("minHours", e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 w-28"
        />
        <input
          type="number"
          placeholder="Min Logs"
          value={filters.minLogs}
          onChange={(e) => handleChange("minLogs", e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 w-28"
        />

        <button
          onClick={handleApply}
          className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm rounded-md shadow"
        >
          Apply Filters
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading progress...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-center"
            >
              <p className="text-sm text-gray-500">Total Students</p>
              <h4 className="text-2xl font-bold text-indigo-700">
                {summary.totalStudents || 0}
              </h4>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center"
            >
              <p className="text-sm text-gray-500">Total Logs</p>
              <h4 className="text-2xl font-bold text-blue-700">
                {summary.totalLogs || 0}
              </h4>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-green-50 border border-green-100 p-4 rounded-xl text-center"
            >
              <p className="text-sm text-gray-500">Total Hours</p>
              <h4 className="text-2xl font-bold text-green-700">
                {summary.totalHours || 0}
              </h4>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-center"
            >
              <p className="text-sm text-gray-500">Average Hours</p>
              <h4 className="text-2xl font-bold text-yellow-700">
                {summary.avgHours || 0}
              </h4>
            </motion.div>
          </div>

          {/* Chart */}
          <div className="w-full h-[360px] bg-white border border-gray-100 rounded-xl shadow-inner p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="logsSubmitted"
                  stroke="#4f46e5"
                  name="Logs Submitted"
                />
                <Line
                  type="monotone"
                  dataKey="attendanceDays"
                  stroke="#22c55e"
                  name="Attendance Days"
                />
                <Line
                  type="monotone"
                  dataKey="totalHours"
                  stroke="#f97316"
                  name="Total Hours"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
