import { motion } from "framer-motion";
import { ClipboardList, Users, FileText, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import API from "@/api/axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MentorHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    assignedStudents: 0,
    totalLogs: 0,
    pendingReviews: 0,
    approvedLogs: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [studentsRes, logsRes] = await Promise.all([
          API.get("/users/assigned-students"),
          API.get("/logpaper/my"),
        ]);

        const logs = logsRes.data || [];
        const pending = logs.filter((l) => l.status === "Pending").length;
        const approved = logs.filter((l) => l.status === "Verified").length;

        if (active) {
          setStats({
            assignedStudents: studentsRes.data?.length || 0,
            totalLogs: logs.length,
            pendingReviews: pending,
            approvedLogs: approved,
          });
        }
      } catch (err) {
        console.error("Mentor dashboard load error:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
      <div className="flex-1 flex flex-col p-10 overflow-y-auto">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-semibold text-indigo-900 mb-2"
        >
          Welcome back, {user?.name || "Mentor"}
        </motion.h2>
        <p className="text-gray-600 mb-10">
          Here’s a quick overview of your assigned students and their practicum
          progress.
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <SummaryCard
            label="Assigned Students"
            value={stats.assignedStudents}
            icon={<Users />}
            color="text-indigo-600"
            onClick={() => navigate("/mentor/students")}
          />
          <SummaryCard
            label="All Logs"
            value={stats.totalLogs}
            icon={<ClipboardList />}
            color="text-blue-600"
            onClick={() => navigate("/mentor/reports")}
          />

          {/* 🔹 Highlighted Pending Verifications */}
          <SummaryCard
            label="Pending Verifications"
            value={stats.pendingReviews}
            icon={<Clock />}
            color="text-blue-700"
            highlight
            onClick={() => navigate("/mentor/reports?status=Pending")}
          />

          <SummaryCard
            label="Verified Logs"
            value={stats.approvedLogs}
            icon={<FileText />}
            color="text-green-600"
            onClick={() => navigate("/mentor/reports?status=Verified")}
          />
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-indigo-600 text-sm opacity-80 mt-12">
          © 2025 EIT Practicum Tracker | Mentor Dashboard
        </footer>
      </div>
    </div>
  );
}

/* 🔹 SummaryCard Component */
function SummaryCard({ label, value, icon, color, highlight, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={`cursor-pointer flex flex-col items-center p-6 rounded-xl shadow-sm border transition ${
        highlight
          ? "bg-gradient-to-br from-blue-200 to-blue-100 border-blue-400 shadow-lg ring-2 ring-blue-300 animate-pulse-slow"
          : "bg-white border-indigo-100 hover:shadow-md"
      }`}
    >
      <div className={`mb-2 ${color} ${highlight ? "animate-pulse" : ""}`}>
        {icon}
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p
        className={`text-sm mt-1 ${
          highlight ? "text-blue-900 font-semibold" : "text-gray-600"
        }`}
      >
        {label}
      </p>
    </motion.div>
  );
}

/* 🔹 InsightBox Component */
function InsightBox({ title, items }) {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm">
      <h4 className="font-semibold text-indigo-700 mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-gray-700">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <div className="h-2 w-2 bg-indigo-400 rounded-full"></div>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
