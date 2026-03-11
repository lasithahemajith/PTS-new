import { useEffect, useState } from "react";
import API from "@/api/axios";

export default function MentorsList() {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const res = await API.get("/users?role=Mentor");
      setMentors(res.data);
    } catch (err) {
      console.error("Failed to fetch mentors", err);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-indigo-700">
        Registered Mentors
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
            {mentors.map((m, i) => (
              <tr key={m.id} className="text-center hover:bg-indigo-50">
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{m.name}</td>
                <td className="border p-2">{m.email}</td>
                <td className="border p-2">
                  {new Date(m.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {mentors.length === 0 && (
              <tr>
                <td colSpan={4} className="text-gray-500 py-3">
                  No mentors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
