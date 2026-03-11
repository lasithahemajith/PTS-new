import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { Filter, Calendar, RefreshCcw } from "lucide-react";

export default function LogSummaryDashboard() {
  const [data, setData] = useState([]);
  const [byMonth, setByMonth] = useState([]);
  const [filters, setFilters] = useState({
    status: "All",
    activity: "All",
    from: "",
    to: "",
  });
  const [loading, setLoading] = useState(true);

  const colors = ["#4f46e5", "#22c55e", "#f97316", "#06b6d4", "#a855f7"];

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams(filters).toString();
    try {
      const res = await API.get(`/dashboard/logs?${params}`);
      setData(res.data.byActivity || []);
      setByMonth(res.data.byMonth || []);
    } catch (err) {
      console.error("Error loading logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    fetchData();
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 border border-indigo-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h3 className="text-xl font-semibold text-indigo-700">
          🗂 Practicum Log Summary
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition"
          >
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-indigo-50/40 p-4 rounded-lg border border-indigo-100 mb-6 flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-indigo-600" />
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Reviewed">Reviewed</option>
        </select>

        <select
          value={filters.activity}
          onChange={(e) => handleFilterChange("activity", e.target.value)}
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
          <Calendar size={15} className="text-gray-500" />
          <label className="text-sm text-gray-600 font-medium">From</label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => handleFilterChange("from", e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <label className="text-sm text-gray-600 font-medium">To</label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => handleFilterChange("to", e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleApply}
          className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm rounded-md shadow"
        >
          Apply Filters
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading summary...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl shadow-sm text-center"
            >
              <p className="text-sm text-gray-500">Total Logs</p>
              <h4 className="text-2xl font-bold text-indigo-700">
                {data.reduce((sum, d) => sum + d.count, 0)}
              </h4>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-green-50 border border-green-100 p-4 rounded-xl shadow-sm text-center"
            >
              <p className="text-sm text-gray-500">Active Activities</p>
              <h4 className="text-2xl font-bold text-green-700">
                {data.length}
              </h4>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm text-center"
            >
              <p className="text-sm text-gray-500">Filtered Range</p>
              <h4 className="text-md font-semibold text-blue-700">
                {filters.from && filters.to
                  ? `${filters.from} → ${filters.to}`
                  : "All Time"}
              </h4>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="w-full h-[350px] bg-white border border-gray-100 rounded-xl shadow-inner p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="name"
                    outerRadius={120}
                    label
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full h-[350px] bg-white border border-gray-100 rounded-xl shadow-inner p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byMonth}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" name="Logs per Month" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
