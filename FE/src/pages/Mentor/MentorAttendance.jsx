import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { motion } from "framer-motion";

export default function MentorAttendance() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/attendance/mentor");
        setRecords(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Error loading mentor attendance:", err);
      }
    })();
  }, []);

  useEffect(() => {
    let filteredData = records;

    if (search.trim()) {
      filteredData = filteredData.filter((r) =>
        r.student.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      filteredData = filteredData.filter((r) => r.attended === statusFilter);
    }

    setFiltered(filteredData);
  }, [search, statusFilter, records]);

  return (
    <div className="p-6">
      <motion.h2
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl font-semibold text-indigo-700 mb-4"
      >
        👨‍🏫 Assigned Students' Practicum Attendance
      </motion.h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-64 focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Status</option>
          <option value="Yes">Attended</option>
          <option value="No">Absent</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center mt-8">
          No attendance records found.
        </p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-indigo-600 text-white text-left">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b hover:bg-indigo-50">
                  <td className="p-3">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 font-medium text-gray-800">
                    {r.student.name}
                  </td>
                  <td className="p-3 text-gray-600">{r.student.email}</td>
                  <td
                    className={`p-3 font-semibold ${
                      r.attended === "Yes" ? "text-green-600" : "text-red-600"
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
