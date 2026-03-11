import React, { useEffect, useState } from "react";
import API from "@/api/axios";

export default function MentorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // 🔹 Backend endpoint that returns students assigned to this mentor
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

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Assigned Students</h2>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 text-slate-500">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-4 text-slate-500">No students assigned.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Course</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id} className="odd:bg-white even:bg-slate-50">
                  <td className="px-3 py-2 border-b">{i + 1}</td>
                  <td className="px-3 py-2 border-b font-medium">{s.name}</td>
                  <td className="px-3 py-2 border-b text-slate-700">{s.email}</td>
                  <td className="px-3 py-2 border-b text-slate-600">
                    {s.course || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-slate-500 mt-3">
        Data fetched from <code>/users/assigned-students</code> endpoint.
      </p>
    </div>
  );
}
