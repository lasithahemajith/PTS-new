import React, { useState } from "react";
import AttendanceForm from "./AttendanceForm";
import AttendanceHistory from "./AttendanceHistory";

export default function AttendanceTabs() {
  const [activeTab, setActiveTab] = useState("add");

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-indigo-100 via-white to-indigo-50 flex justify-center py-4 sm:py-10">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl border border-indigo-100 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex justify-center bg-indigo-50 border-b border-indigo-200">
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all duration-300 relative ${
              activeTab === "add"
                ? "bg-white text-indigo-700 border-b-4 border-indigo-600 shadow-md z-10"
                : "bg-indigo-100 text-gray-600 hover:text-indigo-700 hover:bg-indigo-200 border-b-4 border-transparent"
            }`}
          >
            🕒 Add Attendance
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all duration-300 relative ${
              activeTab === "history"
                ? "bg-white text-indigo-700 border-b-4 border-indigo-600 shadow-md z-10"
                : "bg-indigo-100 text-gray-600 hover:text-indigo-700 hover:bg-indigo-200 border-b-4 border-transparent"
            }`}
          >
            📜 Attendance History
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-8 bg-white rounded-b-2xl transition-all duration-500 ease-in-out">
          {activeTab === "add" ? <AttendanceForm /> : <AttendanceHistory />}
        </div>
      </div>
    </div>
  );
}
