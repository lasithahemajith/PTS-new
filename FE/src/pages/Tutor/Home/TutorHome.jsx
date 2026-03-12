import { motion } from "framer-motion";
import {
  ClipboardList,
  FileText,
  Users,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  UserPlus,
  BookOpen,
  TrendingUp,
  Star,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import API from "@/api/axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          <p className="text-indigo-600 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-10">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 rounded-2xl mb-8 p-8 shadow-xl"
      >
        <div className="relative z-10">
          <p className="text-indigo-200 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-3xl font-bold text-white mb-2">
            {user?.name || "Tutor"}
          </h1>
          <p className="text-indigo-100 text-sm max-w-lg">
            You are overseeing{" "}
            <span className="font-semibold text-white">{stats.totalStudents} students</span> and{" "}
            <span className="font-semibold text-white">{stats.totalMentors} mentors</span>. Stay on top of practicum
            progress and log reviews.
          </p>
          {stats.pendingVerifications > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-300/40 text-yellow-100 px-4 py-2 rounded-lg text-sm">
              <AlertTriangle size={15} />
              <span>
                <span className="font-bold">{stats.pendingVerifications}</span> logs pending mentor verification
              </span>
            </div>
          )}
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-6 right-24 w-28 h-28 bg-purple-400/20 rounded-full blur-xl" />
      </motion.div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Students", value: stats.totalStudents, icon: <Users size={20} />, color: "indigo" },
          { label: "Mentors", value: stats.totalMentors, icon: <CheckCircle size={20} />, color: "emerald" },
          { label: "Total Logs", value: stats.totalLogs, icon: <ClipboardList size={20} />, color: "blue" },
          { label: "Verified Logs", value: stats.approvedLogs, icon: <FileText size={20} />, color: "green" },
          { label: "Pending Verify", value: stats.pendingVerifications, icon: <AlertTriangle size={20} />, color: "yellow" },
          { label: "Feedbacks Given", value: stats.feedbacks, icon: <Star size={20} />, color: "purple" },
        ].map((card, i) => (
          <SummaryCard key={i} {...card} />
        ))}
      </div>

      {/* Quick Actions + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-indigo-50 p-6">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-indigo-500" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction
              to="/tutor/users"
              icon={<UserPlus size={20} />}
              label="Manage Users"
              desc="Add or update students, mentors and tutors"
              color="indigo"
            />
            <QuickAction
              to="/tutor/reports"
              icon={<BookOpen size={20} />}
              label="View Reports"
              desc="Review log submissions and feedback"
              color="purple"
            />
            <QuickAction
              to="/tutor/dashboards"
              icon={<BarChart3 size={20} />}
              label="Dashboards"
              desc="Attendance and progress analytics"
              color="blue"
            />
            <QuickAction
              to="/tutor/reports"
              icon={<TrendingUp size={20} />}
              label="Audit Trail"
              desc="Track system activity and changes"
              color="emerald"
            />
          </div>
        </div>

        {/* Insights Panel */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-700 rounded-2xl shadow-md p-6 text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star size={18} className="text-yellow-300" /> Key Insights
          </h3>
          <ul className="space-y-3 text-sm text-indigo-100">
            {[
              `${stats.totalStudents} students enrolled in practicum`,
              `${stats.approvedLogs} logs verified by mentors`,
              `${stats.feedbacks} total feedbacks provided`,
              stats.pendingVerifications > 0
                ? `${stats.pendingVerifications} logs still pending verification`
                : "No pending mentor verifications",
              "Review dashboards for attendance trends",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 bg-indigo-300 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Program Overview */}
      <div className="bg-white rounded-2xl shadow-md border border-indigo-50 p-6 mb-6">
        <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-500" /> Program Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <p className="font-semibold text-indigo-700 mb-1">Mental Health & Addiction</p>
            <p>Students gain practical experience under supervisor guidance, documented via log papers.</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p className="font-semibold text-purple-700 mb-1">Log Paper Workflow</p>
            <p>Student submits → Mentor verifies → Tutor reviews and provides feedback.</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="font-semibold text-blue-700 mb-1">Attendance Tracking</p>
            <p>Class and practicum sessions are tracked to ensure compliance with program requirements.</p>
          </div>
        </div>
      </div>

      <footer className="text-center py-4 text-indigo-400 text-xs opacity-80">
        © 2025 EIT Practicum Tracking System | Tutor Portal
      </footer>
    </div>
  );
}

/* ── SummaryCard ── */
function SummaryCard({ label, value, icon, color }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };
  const cls = colorMap[color] || colorMap.indigo;
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      className={`flex flex-col items-center p-4 rounded-xl border shadow-sm ${cls}`}
    >
      <div className="mb-2 opacity-80">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500 mt-1 text-center leading-tight">{label}</p>
    </motion.div>
  );
}

/* ── QuickAction Card ── */
function QuickAction({ to, icon, label, desc, color }) {
  const colorMap = {
    indigo: "bg-indigo-50 border-indigo-100 hover:bg-indigo-100 text-indigo-700",
    purple: "bg-purple-50 border-purple-100 hover:bg-purple-100 text-purple-700",
    blue: "bg-blue-50 border-blue-100 hover:bg-blue-100 text-blue-700",
    emerald: "bg-emerald-50 border-emerald-100 hover:bg-emerald-100 text-emerald-700",
  };
  const cls = colorMap[color] || colorMap.indigo;
  return (
    <Link
      to={to}
      className={`group flex items-start gap-3 p-4 rounded-xl border transition-all ${cls}`}
    >
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</p>
      </div>
      <ArrowRight size={14} className="mt-1 opacity-40 group-hover:opacity-80 flex-shrink-0 transition" />
    </Link>
  );
}
