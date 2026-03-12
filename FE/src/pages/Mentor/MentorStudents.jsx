import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { motion } from "framer-motion";
import { Users, Search, Loader2 } from "lucide-react";

export default function MentorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await API.get("/users/assigned-students");
        if (active) setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = students.filter((s) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.studentIndex?.toLowerCase().includes(q)
    );
  });

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
          <Users size={22} className="text-indigo-600" />
          My Assigned Students
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {students.length > 0
            ? `You have ${students.length} student${students.length !== 1 ? "s" : ""} assigned to you.`
            : "Students assigned to you will appear here."}
        </p>
      </motion.div>

      {/* Search */}
      {students.length > 0 && (
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-72 shadow-sm mb-5">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or index…"
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users size={40} className="mb-3 text-indigo-200" />
            <p className="text-sm font-medium">
              {search.trim() ? "No students match your search." : "No students assigned."}
            </p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-indigo-700 text-white text-left">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Index</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Course</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.id || s._id || i}
                  className="border-t odd:bg-white even:bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 font-semibold text-xs uppercase flex-shrink-0">
                        {s.name?.charAt(0) || "?"}
                      </div>
                      <span className="font-medium text-gray-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.studentIndex || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{s.email}</td>
                  <td className="px-4 py-3 text-gray-600">{s.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{s.course || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 text-right">
          Showing {filtered.length} of {students.length} student{students.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
