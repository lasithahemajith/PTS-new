import { useEffect, useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import API from "@/api/axios";

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [resetModal, setResetModal] = useState(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [resetResult, setResetResult] = useState(null);
  const [resetting, setResetting] = useState(false);

  // Edit state
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete state
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/users?role=Student");
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const openResetModal = (student) => {
    setResetModal(student);
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

  // Edit handlers
  const openEditModal = (student) => {
    setEditModal(student);
    setEditForm({ name: student.name, email: student.email, phone: student.phone || "", studentIndex: student.studentIndex || "" });
    setEditError("");
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditForm({});
    setEditError("");
  };

  const handleEditSave = async () => {
    setEditSaving(true);
    setEditError("");
    try {
      await API.put(`/users/${editModal._id}`, editForm);
      closeEditModal();
      fetchStudents();
    } catch (err) {
      setEditError(err.response?.data?.error || "Failed to update student");
    } finally {
      setEditSaving(false);
    }
  };

  // Delete handlers
  const openDeleteModal = (student) => setDeleteModal(student);
  const closeDeleteModal = () => setDeleteModal(null);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/users/${deleteModal._id}`);
      closeDeleteModal();
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.studentIndex || "").toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-indigo-700">
        Registered Students
      </h3>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-72 shadow-sm mb-4">
        <Search size={15} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, index or email…"
          className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-indigo-50 text-gray-700">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Index Number</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Created</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s, i) => (
              <tr key={s._id} className="text-center hover:bg-indigo-50">
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{s.name}</td>
                <td className="border p-2">{s.studentIndex || "—"}</td>
                <td className="border p-2">{s.email}</td>
                <td className="border p-2">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td className="border p-2">
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    <button
                      onClick={() => openResetModal(s)}
                      className="text-xs px-2 py-1 bg-orange-100 text-orange-700 border border-orange-300 rounded hover:bg-orange-200"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => openEditModal(s)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 flex items-center gap-1"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(s)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={6} className="text-gray-500 py-3">
                  No students found.
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

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Edit Student</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone || ""}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Index Number</label>
                <input
                  type="text"
                  value={editForm.studentIndex || ""}
                  onChange={(e) => setEditForm({ ...editForm, studentIndex: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
              {editError && <p className="text-red-600 text-sm">❌ {editError}</p>}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="flex-1 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40"
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={closeEditModal}
                className="flex-1 py-2 rounded border text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h4 className="text-lg font-bold text-gray-800 mb-2">Delete Student</h4>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deleteModal.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-40"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={closeDeleteModal}
                className="flex-1 py-2 rounded border text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
