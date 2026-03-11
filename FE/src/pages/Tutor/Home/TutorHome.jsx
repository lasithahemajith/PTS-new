import { motion } from "framer-motion";
import {
  ClipboardList,
  FileText,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import API from "@/api/axios";
import { useEffect, useState } from "react";

export default function TutorHome() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalMentors: 0,
    totalLogs: 0,
    pendingVerifications: 0,
    approvedLogs: 0,
    feedbacks: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await API.get("/tutor/dashboard-stats");
        if (active) {
          setStats({
            totalStudents: data.totalStudents,
            totalMentors: data.totalMentors,
            totalLogs: data.totalLogs,
            pendingVerifications: data.pendingLogs,
            approvedLogs: data.verifiedLogs,
            feedbacks:
              (data.tutorFeedbacks || 0) + (data.mentorFeedbacks || 0),
          });
        }
      } catch (err) {
        console.error("Dashboard stats fetch failed:", err);
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
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-100 to-blue-50">
      <div className="flex-1 flex flex-col p-10 overflow-y-auto">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-semibold text-indigo-900 mb-2"
        >
          Welcome back, {user?.name || "Tutor"}
        </motion.h2>
        <p className="text-gray-600 mb-10">
          Here’s an overview of your practicum supervision and student
          progress.
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
          <SummaryCard
            label="Students"
            value={stats.totalStudents}
            icon={<Users />}
            color="text-indigo-600"
          />
          <SummaryCard
            label="Mentors"
            value={stats.totalMentors}
            icon={<CheckCircle />}
            color="text-emerald-600"
          />
          <SummaryCard
            label="Logs Submitted"
            value={stats.totalLogs}
            icon={<ClipboardList />}
            color="text-blue-600"
          />
          <SummaryCard
            label="Verified Logs by Mentor"
            value={stats.approvedLogs}
            icon={<FileText />}
            color="text-green-600"
          />
          <SummaryCard
            label="Pending Verifications from Mentor"
            value={stats.pendingVerifications}
            icon={<AlertTriangle />}
            color="text-yellow-600"
          />
          <SummaryCard
            label="Feedbacks Given by Tutor"
            value={stats.feedbacks}
            icon={<Clock />}
            color="text-purple-600"
          />
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-indigo-600 text-sm opacity-80 mt-12">
          © 2025 EIT Practicum Tracker | Tutor Home
        </footer>
      </div>
    </div>
  );
}

/* 🔹 SummaryCard Component */
function SummaryCard({ label, value, icon, color }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="flex flex-col items-center bg-white p-5 rounded-xl shadow-sm border border-indigo-100"
    >
      <div className={`mb-2 ${color}`}>{icon}</div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
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
