import React, { useState } from "react";
import API from "@/api/axios";
import Swal from "sweetalert2";

export default function AttendanceForm() {
  const [type, setType] = useState("Class");
  const [attended, setAttended] = useState("Yes");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/attendance", {
        type,
        attended,
        reason: attended === "No" ? reason : null,
      });

      Swal.fire({
        icon: "success",
        title: "Attendance Submitted",
        text: res.data.message,
        timer: 2000,
        showConfirmButton: false,
      });

      setType("Class");
      setAttended("Yes");
      setReason("");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: err.response?.data?.error || "Failed to submit attendance",
      });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Type</label>
          <div className="flex justify-between">
            {["Class", "Practicum"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={`flex-1 mx-1 py-2 rounded-lg font-medium transition-all ${
                  type === option
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-indigo-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Attended */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Attended</label>
          <div className="flex justify-between">
            {["Yes", "No"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAttended(option)}
                className={`flex-1 mx-1 py-2 rounded-lg font-medium transition-all ${
                  attended === option
                    ? option === "Yes"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Reason */}
        {attended === "No" && (
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select reason</option>
              <option value="Sick">🤒 Sick</option>
              <option value="At Work">💼 At Work</option>
              <option value="Other">📝 Other</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-all"
        >
          Submit Attendance
        </button>
      </form>
    </div>
  );
}
