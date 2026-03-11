import { useState } from "react";
import { motion } from "framer-motion";
import AttendanceDashboard from "./AttendanceDashboard";
import LogSummaryDashboard from "./LogSummaryDashboard";
import StudentProgressDashboard from "./StudentProgressDashboard";

export default function TutorDashboardTabs() {
  const [activeTab, setActiveTab] = useState("attendance");

  const tabs = [
    { key: "attendance", label: "📊 Attendance Overview" },
    { key: "logs", label: "🗂 Practicum Log Summary" },
   // { key: "progress", label: "👩‍🎓 Student Progress Tracker" },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-indigo-100 rounded-xl shadow-inner min-h-[calc(100vh-80px)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-indigo-800">
          📈 Tutor Dashboards
        </h2>
      </div>

      <div className="flex space-x-3 border-b border-indigo-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-all ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "attendance" && <AttendanceDashboard />}
        {activeTab === "logs" && <LogSummaryDashboard />}
        {activeTab === "progress" && <StudentProgressDashboard />}
      </motion.div>
    </div>
  );
}
