import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import API from "@/api/axios";

export default function MentorsList() {
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState("");
  const [resetModal, setResetModal] = useState(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [resetResult, setResetResult] = useState(null);
  const [resetting, setResetting] = useState(false);

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

  const openResetModal = (mentor) => {
    setResetModal(mentor);
    setConfirmEmail("");
    setResetResult(null);
  };

  const closeResetModal = () => {
    setResetModal(null);
    setConfirmEmail("");
    setResetResult(null);
  };

  const handleReset = async () => {
    if (confirmEmail !== resetModal.email) return;
    setResetting(true);
    try {
      const res = await API.post(`/users/${resetModal._id}/reset-password`);
      setResetResult(res.data);
    } catch (err) {
      setResetResult({ error: err.response?.data?.error || "Reset failed" });
    } finally {
      setResetting(false);
    }
  };

  const filteredMentors = mentors.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.company || "").toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-indigo-700">
        Registered Mentors
      </h3>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-72 shadow-sm mb-4">
        <Search size={15} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, company or email…"
          className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-indigo-50 text-gray-700">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Company</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Created</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMentors.map((m, i) => (
              <tr key={m._id} className="text-center hover:bg-indigo-50">
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{m.name}</td>
                <td className="border p-2">{m.company || "—"}</td>
                <td className="border p-2">{m.email}</td>
                <td className="border p-2">
                  {new Date(m.createdAt).toLocaleDateString()}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => openResetModal(m)}
                    className="text-xs px-2 py-1 bg-orange-100 text-orange-700 border border-orange-300 rounded hover:bg-orange-200"
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
            {filteredMentors.length === 0 && (
              <tr>
                <td colSpan={6} className="text-gray-500 py-3">
                  No mentors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-bold text-gray-800 mb-2">Reset Password</h4>
            {!resetResult ? (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  To confirm resetting the password for{" "}
                  <strong>{resetModal.name}</strong>, please type their email address:
                </p>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={resetModal.email}
                  className="w-full border p-2 rounded mb-4 text-sm"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    disabled={confirmEmail !== resetModal.email || resetting}
                    className="flex-1 py-2 rounded bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-40"
                  >
                    {resetting ? "Resetting..." : "Yes, Reset Password"}
                  </button>
                  <button
                    onClick={closeResetModal}
                    className="flex-1 py-2 rounded border text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : resetResult.error ? (
              <>
                <p className="text-red-600 text-sm mb-3">❌ {resetResult.error}</p>
                <button onClick={closeResetModal} className="w-full py-2 rounded border text-gray-700 hover:bg-gray-50">Close</button>
              </>
            ) : (
              <>
                <p className="text-green-700 text-sm mb-2">✅ Password reset successfully.</p>
                <div className="bg-indigo-50 border rounded p-3 mb-3">
                  <p className="text-xs text-gray-600 mb-1">New temporary password:</p>
                  <p className="font-mono text-gray-800">{resetResult.generatedPassword}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(resetResult.generatedPassword)}
                    className="mt-2 text-xs px-2 py-1 border rounded bg-white hover:bg-gray-50"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">Share this privately. The user will be required to change it on next login.</p>
                <button onClick={closeResetModal} className="w-full py-2 rounded border text-gray-700 hover:bg-gray-50">Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
