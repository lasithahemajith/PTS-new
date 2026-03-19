import { useEffect, useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import API from "@/api/axios";

export default function TutorsList() {
  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState("");

  // Edit state
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete state
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  // Edit handlers
  const openEditModal = (tutor) => {
    setEditModal(tutor);
    setEditForm({ name: tutor.name, email: tutor.email, phone: tutor.phone || "" });
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
      fetchTutors();
    } catch (err) {
      setEditError(err.response?.data?.error || "Failed to update tutor");
    } finally {
      setEditSaving(false);
    }
  };

  // Delete handlers — tutors cannot be deleted (backend will reject), but we show the option for completeness
  const openDeleteModal = (tutor) => setDeleteModal(tutor);
  const closeDeleteModal = () => setDeleteModal(null);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/users/${deleteModal._id}`);
      closeDeleteModal();
      fetchTutors();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete tutor");
      closeDeleteModal();
    } finally {
      setDeleting(false);
    }
  };

  const filteredTutors = tutors.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-indigo-700">
        Registered Tutors (Admins)
      </h3>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-72 shadow-sm mb-4">
        <Search size={15} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-indigo-50 text-gray-700">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Created</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTutors.map((t, i) => (
              <tr key={t._id} className="text-center hover:bg-indigo-50">
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{t.name}</td>
                <td className="border p-2">{t.email}</td>
                <td className="border p-2">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
                <td className="border p-2">
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    <button
                      onClick={() => openEditModal(t)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 flex items-center gap-1"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(t)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTutors.length === 0 && (
              <tr>
                <td colSpan={5} className="text-gray-500 py-3">
                  No tutors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Edit Tutor</h4>
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
            <h4 className="text-lg font-bold text-gray-800 mb-2">Delete Tutor</h4>
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
