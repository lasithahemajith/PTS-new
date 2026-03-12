import { useState } from "react";
import API from "@/api/axios";

export default function CreateUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Student",
    phone: "",
    studentIndex: "",
    company: "",
  });
  const [message, setMessage] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setGeneratedPassword("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        phone: form.phone,
      };

      if (form.role === "Student" && form.studentIndex) {
        payload.studentIndex = form.studentIndex;
      }

      if (form.role === "Mentor" && form.company) {
        payload.company = form.company;
      }

      const res = await API.post("/users", payload);

      setMessage(res.data.message || "✅ User created successfully");
      if (res.data.generatedPassword) setGeneratedPassword(res.data.generatedPassword);

      setForm({
        name: "",
        email: "",
        role: "Student",
        phone: "",
        studentIndex: "",
        company: "",
      });
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "❌ Failed to create user");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-indigo-700 mb-4">Create New User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role First */}
        <div>
          <label className="block text-sm font-medium mb-1">User Type</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option>Student</option>
            <option>Mentor</option>
            <option>Tutor</option>
          </select>
        </div>

        {/* Common Fields */}
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Student-only: Index Number */}
        {form.role === "Student" && (
          <div>
            <label className="block text-sm font-medium mb-1">Index Number</label>
            <input
              name="studentIndex"
              value={form.studentIndex}
              onChange={handleChange}
              placeholder="e.g. EIT/2021/001"
              className="w-full border p-2 rounded"
            />
          </div>
        )}

        {/* Mentor-only: Company */}
        {form.role === "Mentor" && (
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Company Name"
              className="w-full border p-2 rounded"
            />
          </div>
        )}

        {/* Info */}
        <div className="bg-indigo-50 text-sm text-gray-700 p-3 rounded-md">
          Password will be auto-generated and securely stored. Tutors can view it once.
          The user will be required to change their password on first login.
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded w-full"
        >
          Create User
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}

      {generatedPassword && (
        <div className="mt-4 border p-3 rounded bg-indigo-50">
          <h4 className="font-semibold text-indigo-700 mb-1">
            Auto-Generated Password (Visible to Tutor Only)
          </h4>
          <p className="text-gray-800 font-mono text-sm mb-2">{generatedPassword}</p>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(generatedPassword)}
            className="text-sm px-3 py-1 border rounded bg-white hover:bg-gray-50"
          >
            Copy Password
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Share this password privately with the user. It will not appear again.
          </p>
        </div>
      )}
    </div>
  );
}
