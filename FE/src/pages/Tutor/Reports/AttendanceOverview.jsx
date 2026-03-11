import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

export default function AttendanceOverview() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ✅ Load data
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/attendance/tutor");
        setRecords(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Error loading tutor attendance:", err);
      }
    })();
  }, []);

  // ✅ Apply filters
  useEffect(() => {
    let data = records;

    if (search.trim()) {
      data = data.filter((r) =>
        r.student.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (typeFilter !== "All") {
      data = data.filter((r) => r.type === typeFilter);
    }

    if (statusFilter !== "All") {
      data = data.filter((r) => r.attended === statusFilter);
    }

    if (fromDate) {
      data = data.filter((r) => new Date(r.createdAt) >= new Date(fromDate));
    }

    if (toDate) {
      data = data.filter((r) => new Date(r.createdAt) <= new Date(toDate));
    }

    setFiltered(data);
  }, [search, typeFilter, statusFilter, fromDate, toDate, records]);

  // ✅ Export as CSV
  const handleExport = () => {
    const csvData = [
      ["Date", "Student Name", "Email", "Type", "Status", "Reason"],
      ...filtered.map((r) => [
        new Date(r.createdAt).toLocaleDateString(),
        r.student.name,
        r.student.email,
        r.type,
        r.attended,
        r.reason || "-",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "AttendanceOverview.csv";
    link.click();
  };

  // 🔹 Dropdown with color-coded options
  const getStatusColor = (value) => {
    switch (value) {
      case "Yes":
        return "bg-green-100 text-green-700 border-green-400";
      case "No":
        return "bg-red-100 text-red-700 border-red-400";
      default:
        return "bg-indigo-100 text-indigo-700 border-indigo-400";
    }
  };

  return (
    <div className="p-4">
      {/* 🔹 Header with Export Button */}
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-indigo-700"
        >
          📊 Attendance Overview
        </motion.h2>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow transition-all"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* 🔹 Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search by student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-52 focus:ring-2 focus:ring-indigo-500"
          />

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Types</option>
            <option value="Class">Class</option>
            <option value="Practicum">Practicum</option>
          </select>

          {/* Status (Color-coded) */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 ${getStatusColor(
              statusFilter
            )}`}
          >
            <option value="All" className="text-indigo-700">
              All Status
            </option>
            <option value="Yes" className="text-green-700">
              Attended
            </option>
            <option value="No" className="text-red-700">
              Absent
            </option>
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
            />
            <label className="text-sm text-gray-600 font-medium">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 🔹 Attendance Table */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          No attendance records found.
        </p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-indigo-700 text-white">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Student Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b ${
                    i % 2 === 0 ? "bg-indigo-50" : "bg-white"
                  } hover:bg-indigo-100 transition-all`}
                >
                  <td className="p-3 font-medium text-gray-700">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-gray-900 font-semibold">
                    {r.student.name}
                  </td>
                  <td className="p-3 text-gray-600">{r.student.email}</td>
                  <td
                    className={`p-3 font-medium ${
                      r.type === "Class" ? "text-blue-700" : "text-purple-700"
                    }`}
                  >
                    {r.type}
                  </td>
                  <td
                    className={`p-3 font-semibold ${
                      r.attended === "Yes"
                        ? "text-green-700 bg-green-50 rounded-lg px-2 py-1 inline-block"
                        : "text-red-700 bg-red-50 rounded-lg px-2 py-1 inline-block"
                    }`}
                  >
                    {r.attended}
                  </td>
                  <td className="p-3 text-gray-700">{r.reason || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
