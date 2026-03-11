import { useEffect, useState } from "react";
import API from "@/api/axios";

export default function MappingTab() {
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [mentorId, setMentorId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchMappings();
  }, []);

  const fetchUsers = async () => {
    try {
      const [mentorsRes, studentsRes] = await Promise.all([
        API.get("/users?role=Mentor"),
        API.get("/users?role=Student"),
      ]);
      setMentors(mentorsRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchMappings = async () => {
    try {
      const res = await API.get("/users/mappings");
      setMappings(res.data);
    } catch (err) {
      console.error("Failed to fetch mappings", err);
    }
  };

  const handleMap = async () => {
    if (!mentorId || !studentId) return;
    try {
      await API.post("/users/map", { mentorId, studentId });
      setMessage("✅ Mentor successfully mapped to student.");
      fetchMappings();
    } catch {
      setMessage("❌ Failed to map mentor and student.");
    }
  };

  const handleUnmap = async (m) => {
    try {
      await API.delete("/users/map", {
        data: { mentorId: m.mentor.id, studentId: m.student.id },
      });
      setMessage("🗑️ Mapping removed successfully.");
      fetchMappings();
    } catch {
      setMessage("❌ Failed to remove mapping.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-indigo-700">
        Mentor–Student Mapping
      </h3>

      {/* Mapping form */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Mentor</label>
          <select
            value={mentorId}
            onChange={(e) => setMentorId(e.target.value)}
            className="border rounded p-2 min-w-[200px]"
          >
            <option value="">Select Mentor</option>
            {mentors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Student</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="border rounded p-2 min-w-[200px]"
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleMap}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Map
        </button>
      </div>

      {message && (
        <p className="text-sm text-center mb-4 text-indigo-600">{message}</p>
      )}

      {/* Mappings table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-indigo-50 text-gray-700">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Mentor</th>
              <th className="p-2 border">Student</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m, i) => (
              <tr key={m.id} className="text-center hover:bg-indigo-50">
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{m.mentor.name}</td>
                <td className="border p-2">{m.student.name}</td>
                <td className="border p-2">
                  {new Date(m.createdAt).toLocaleDateString()}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleUnmap(m)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    Unmap
                  </button>
                </td>
              </tr>
            ))}
            {mappings.length === 0 && (
              <tr>
                <td colSpan={5} className="text-gray-500 py-3">
                  No mappings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
