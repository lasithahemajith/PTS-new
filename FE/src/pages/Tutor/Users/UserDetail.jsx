import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api/axios";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, mappingsRes] = await Promise.all([
          API.get(`/users/${id}`),
          API.get("/users/mappings"),
        ]);
        setUser(userRes.data);
        setMappings(mappingsRes.data);
      } catch (err) {
        console.error("Failed to fetch user details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="p-6 text-gray-500 text-sm">Loading user details…</div>
    );

  if (!user)
    return (
      <div className="p-6 text-red-500 text-sm">User not found.</div>
    );

  const userMappings = mappings.filter(
    (m) =>
      m.mentor?.id === id ||
      m.student?.id === id ||
      m.mentor?._id?.toString() === id ||
      m.student?._id?.toString() === id
  );

  const roleColor =
    user.role === "Mentor"
      ? "bg-blue-100 text-blue-700"
      : user.role === "Student"
      ? "bg-green-100 text-green-700"
      : "bg-purple-100 text-purple-700";

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/tutor/users")}
        className="text-sm text-indigo-600 hover:underline mb-4 block"
      >
        ← Back to Users
      </button>

      <h3 className="text-lg font-semibold mb-4 text-indigo-700">
        User Details
      </h3>

      {/* User info card */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 font-bold text-lg uppercase flex-shrink-0">
            {user.name?.charAt(0) || "?"}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-base">{user.name}</p>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColor}`}
            >
              {user.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Email</p>
            <p className="font-medium text-gray-800">{user.email}</p>
          </div>
          {user.phone && (
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Phone</p>
              <p className="font-medium text-gray-800">{user.phone}</p>
            </div>
          )}
          {user.studentIndex && (
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Student Index</p>
              <p className="font-medium text-gray-800">{user.studentIndex}</p>
            </div>
          )}
          {user.company && (
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Company</p>
              <p className="font-medium text-gray-800">{user.company}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Registered</p>
            <p className="font-medium text-gray-800">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Mappings section */}
      {userMappings.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {user.role === "Mentor" ? "Assigned Students" : "Assigned Mentor"}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200">
              <thead className="bg-indigo-50 text-gray-700">
                <tr>
                  <th className="p-2 border">Mentor</th>
                  <th className="p-2 border">Student</th>
                  <th className="p-2 border">Index</th>
                  <th className="p-2 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {userMappings.map((m) => (
                  <tr key={m.id} className="text-center hover:bg-indigo-50">
                    <td className="border p-2">{m.mentor?.name}</td>
                    <td className="border p-2">{m.student?.name}</td>
                    <td className="border p-2">
                      {m.student?.studentIndex || "—"}
                    </td>
                    <td className="border p-2">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {userMappings.length === 0 && (
        <p className="text-sm text-gray-400">No mappings found for this user.</p>
      )}
    </div>
  );
}
