import { useEffect, useState } from "react";
import API from "@/api/axios";

export default function TutorsList() {
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const res = await API.get("/users?role=Tutor");
      setTutors(res.data);
    } catch (err) {
      console.error("Failed to fetch tutors", err);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-indigo-700">
        Registered Tutors (Admins)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-indigo-50 text-gray-700">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Created</th>
            </tr>
          </thead>
          <tbody>
            {tutors.map((t, i) => (
              <tr key={t.id} className="text-center hover:bg-indigo-50">
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{t.name}</td>
                <td className="border p-2">{t.email}</td>
                <td className="border p-2">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {tutors.length === 0 && (
              <tr>
                <td colSpan={4} className="text-gray-500 py-3">
                  No tutors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
