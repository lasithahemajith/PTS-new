import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AttendanceDashboard from "./AttendanceDashboard";
import LogSummaryDashboard from "./LogSummaryDashboard";
import StudentProgressDashboard from "./StudentProgressDashboard";
import { BarChart3, BookOpen, GraduationCap } from "lucide-react";

const tabs = [
  
  {
    key: "logs",
    label: "Practicum Log Summary",
    icon: <BookOpen size={16} />,
  },
  {
    key: "attendance",
    label: "Attendance Overview",
    icon: <BarChart3 size={16} />,
  },
  // {
  //   key: "progress",
  //   label: "Student Progress",
  //   icon: <GraduationCap size={16} />,
  // },
];

export default function TutorDashboardTabs() {
  const [activeTab, setActiveTab] = useState("logs");

  return (
    <div className="min-h-[calc(100vh-80px)]">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
          <BarChart3 className="text-indigo-500" size={24} />
          Practicum Dashboards
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Track attendance, log submissions and student progress across the practicum programme.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-indigo-50 border border-indigo-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-indigo-600 hover:bg-white/60"
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.key && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "attendance" && <AttendanceDashboard />}
          {activeTab === "logs" && <LogSummaryDashboard />}
          {activeTab === "progress" && <StudentProgressDashboard />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
