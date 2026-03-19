import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { motion } from "framer-motion";
import { Download, Plus, Pencil, Trash2 } from "lucide-react";

export default function AttendanceOverview() {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Edit modal state
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Add modal state
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ studentId: "", type: "Class", attended: "Yes", reason: "", date: "" });
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");

  // Load data
  const fetchRecords = async () => {
    try {
      const res = await API.get("/attendance/tutor");
      const data = Array.isArray(res.data) ? res.data : [];
      setRecords(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error loading tutor attendance:", err);
    }
  };

  useEffect(() => {
    fetchRecords();
    // Fetch students for add modal
    API.get("/users?role=Student").then((res) => setStudents(res.data || [])).catch(() => {});
  }, []);

  // Apply filters
  useEffect(() => {
    let data = records;

    if (search.trim()) {
      data = data.filter((r) =>
        r.studentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.studentId?.studentIndex?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (typeFilter !== "All") {
      data = data.filter((r) => r.type === typeFilter);
    }

    if (statusFilter !== "All") {
      data = data.filter((r) => r.attended === statusFilter);
    }

    if (fromDate) {
      data = data.filter((r) => new Date(r.createdAt) >= new Date(fromDate));
    }

    if (toDate) {
      data = data.filter((r) => new Date(r.createdAt) <= new Date(toDate));
    }

    setFiltered(data);
  }, [search, typeFilter, statusFilter, fromDate, toDate, records]);

  // Export as CSV
  const handleExport = () => {
    const csvData = [
      ["Date", "Student Name", "Index", "Email", "Type", "Status", "Reason"],
      ...filtered.map((r) => [
        new Date(r.createdAt).toLocaleDateString(),
        r.studentId?.name || "N/A",
        r.studentId?.studentIndex || "N/A",
        r.studentId?.email || "N/A",
        r.type,
        r.attended,
        r.reason || "-",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "AttendanceOverview.csv";
    link.click();
  };

  const getStatusColor = (value) => {
    switch (value) {
      case "Yes": return "bg-green-100 text-green-700 border-green-400";
      case "No": return "bg-red-100 text-red-700 border-red-400";
      default: return "bg-indigo-100 text-indigo-700 border-indigo-400";
    }
  };

  // Edit handlers
  const openEditModal = (record) => {
    setEditModal(record);
    setEditForm({ type: record.type, attended: record.attended, reason: record.reason || "" });
  };

  const handleEditSave = async () => {
    setEditSaving(true);
    try {
      await API.put(`/attendance/${editModal._id}`, editForm);
      setEditModal(null);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update attendance");
    } finally {
      setEditSaving(false);
    }
  };

  // Delete handlers
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/attendance/${deleteModal._id}`);
      setDeleteModal(null);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete attendance");
    } finally {
      setDeleting(false);
    }
  };

  // Add attendance handler
  const handleAddSave = async () => {
    setAddSaving(true);
    setAddError("");
    try {
      await API.post("/attendance/tutor/add", addForm);
      setAddModal(false);
      setAddForm({ studentId: "", type: "Class", attended: "Yes", reason: "", date: "" });
      fetchRecords();
    } catch (err) {
      setAddError(err.response?.data?.error || "Failed to add attendance");
    } finally {
      setAddSaving(false);
    }
  };

  return (
    <div className="p-4">
      {/* Header with Export + Add Buttons */}
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-indigo-700"
        >
          📊 Attendance Overview
        </motion.h2>

        <div className="flex gap-2">
          <button
            onClick={() => { setAddModal(true); setAddError(""); }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition-all"
          >
            <Plus size={16} /> Add Attendance
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow transition-all"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="🔍 Search by name or index..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-52 focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Types</option>
            <option value="Class">Class</option>
            <option value="Practicum">Practicum</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 ${getStatusColor(statusFilter)}`}
          >
            <option value="All" className="text-indigo-700">All Status</option>
            <option value="Yes" className="text-green-700">Attended</option>
            <option value="No" className="text-red-700">Absent</option>
          </select>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
            />
            <label className="text-sm text-gray-600 font-medium">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No attendance records found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-indigo-700 text-white">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Student Name</th>
                <th className="p-3 text-left">Index</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={r._id || r.id}
                  className={`border-b ${i % 2 === 0 ? "bg-indigo-50" : "bg-white"} hover:bg-indigo-100 transition-all`}
                >
                  <td className="p-3 font-medium text-gray-700">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-gray-900 font-semibold">
                    {r.studentId?.name || "N/A"}
                  </td>
                  <td className="p-3 text-gray-600">
                    {r.studentId?.studentIndex || "—"}
                  </td>
                  <td className={`p-3 font-medium ${r.type === "Class" ? "text-blue-700" : "text-purple-700"}`}>
                    {r.type}
                  </td>
                  <td className={`p-3 font-semibold ${r.attended === "Yes" ? "text-green-700" : "text-red-700"}`}>
                    {r.attended}
                  </td>
                  <td className="p-3 text-gray-700">{r.reason || "-"}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(r)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 flex items-center gap-1"
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteModal(r)}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 flex items-center gap-1"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Edit Attendance</h4>
            <p className="text-sm text-gray-600 mb-3">
              Student: <strong>{editModal.studentId?.name || "N/A"}</strong>
              {editModal.studentId?.studentIndex && ` (${editModal.studentId.studentIndex})`}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                >
                  <option value="Class">Class</option>
                  <option value="Practicum">Practicum</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.attended}
                  onChange={(e) => setEditForm({ ...editForm, attended: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                >
                  <option value="Yes">Attended (Yes)</option>
                  <option value="No">Absent (No)</option>
                </select>
              </div>
              {editForm.attended === "No" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <select
                    value={editForm.reason}
                    onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                    className="w-full border p-2 rounded text-sm"
                  >
                    <option value="">Select reason</option>
                    <option value="Sick">Sick</option>
                    <option value="At Work">At Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}
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
                onClick={() => setEditModal(null)}
                className="flex-1 py-2 rounded border text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h4 className="text-lg font-bold text-gray-800 mb-2">Delete Attendance</h4>
            <p className="text-sm text-gray-600 mb-4">
              Delete attendance record for <strong>{deleteModal.studentId?.name || "this student"}</strong> on{" "}
              <strong>{new Date(deleteModal.createdAt).toLocaleDateString()}</strong>?
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
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2 rounded border text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Attendance Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Add Attendance for Student</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  value={addForm.studentId}
                  onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.name}{s.studentIndex ? ` (${s.studentIndex})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={addForm.date}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={addForm.type}
                  onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                >
                  <option value="Class">Class</option>
                  <option value="Practicum">Practicum</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={addForm.attended}
                  onChange={(e) => setAddForm({ ...addForm, attended: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                >
                  <option value="Yes">Attended (Yes)</option>
                  <option value="No">Absent (No)</option>
                </select>
              </div>
              {addForm.attended === "No" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <select
                    value={addForm.reason}
                    onChange={(e) => setAddForm({ ...addForm, reason: e.target.value })}
                    className="w-full border p-2 rounded text-sm"
                  >
                    <option value="">Select reason</option>
                    <option value="Sick">Sick</option>
                    <option value="At Work">At Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}
              {addError && <p className="text-red-600 text-sm">❌ {addError}</p>}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddSave}
                disabled={addSaving || !addForm.studentId || !addForm.date}
                className="flex-1 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-40"
              >
                {addSaving ? "Adding..." : "Add Attendance"}
              </button>
              <button
                onClick={() => { setAddModal(false); setAddError(""); }}
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
