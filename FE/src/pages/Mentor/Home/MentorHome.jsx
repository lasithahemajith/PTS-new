import { motion } from "framer-motion";
import {
  ClipboardList,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  CalendarDays,
  BookOpen,
} from "lucide-react";
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
  const [recentPending, setRecentPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [studentsRes, logsRes] = await Promise.all([
          API.get("/users/assigned-students"),
          API.get("/logpaper/mentor/reports"),
        ]);

        const logs = logsRes.data || [];
        const pending = logs.filter((l) => l.status === "Pending");
        const approved = logs.filter((l) => l.status === "Verified").length;

        if (active) {
          setStats({
            assignedStudents: studentsRes.data?.length || 0,
            totalLogs: logs.length,
            pendingReviews: pending.length,
            approvedLogs: approved,
          });
          setRecentPending(pending.slice(0, 5));
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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 md:p-10">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 mb-8 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <p className="text-indigo-200 text-sm font-medium">{greeting()},</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            {user?.name || "Mentor"} 👋
          </h1>
          <p className="text-indigo-200 text-sm mt-2">
            Here's an overview of your assigned students and their practicum
            progress.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1 text-sm text-indigo-200">
          <span className="flex items-center gap-1">
            <CalendarDays size={14} />
            {new Date().toLocaleDateString("en-NZ", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={14} />
            Mentor Dashboard
          </span>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <SummaryCard
          label="Assigned Students"
          value={stats.assignedStudents}
          icon={<Users size={22} />}
          colorClass="text-indigo-600"
          bgClass="bg-indigo-50"
          borderClass="border-indigo-200"
          onClick={() => navigate("/mentor/students")}
          delay={0}
        />
        <SummaryCard
          label="Total Logs"
          value={stats.totalLogs}
          icon={<ClipboardList size={22} />}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
          borderClass="border-blue-200"
          onClick={() => navigate("/mentor/reports")}
          delay={0.1}
        />
        <SummaryCard
          label="Pending Verifications"
          value={stats.pendingReviews}
          icon={<AlertTriangle size={22} />}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
          borderClass="border-amber-300"
          highlight
          onClick={() => navigate("/mentor/reports")}
          delay={0.2}
        />
        <SummaryCard
          label="Verified Logs"
          value={stats.approvedLogs}
          icon={<CheckCircle size={22} />}
          colorClass="text-green-600"
          bgClass="bg-green-50"
          borderClass="border-green-200"
          onClick={() => navigate("/mentor/reports")}
          delay={0.3}
        />
      </div>

      {/* Quick Actions + Recent Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6"
        >
          <h3 className="text-base font-semibold text-indigo-800 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <QuickAction
              label="View Assigned Students"
              icon={<Users size={16} />}
              color="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => navigate("/mentor/students")}
            />
            <QuickAction
              label="Review Pending Logs"
              icon={<Clock size={16} />}
              color="bg-amber-500 hover:bg-amber-600"
              onClick={() => navigate("/mentor/reports")}
            />
            <QuickAction
              label="View All Reports"
              icon={<FileText size={16} />}
              color="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/mentor/reports")}
            />
            <QuickAction
              label="Attendance Overview"
              icon={<CalendarDays size={16} />}
              color="bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate("/mentor/attendance")}
            />
          </div>
        </motion.div>

        {/* Recent Pending Logs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-indigo-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-indigo-800">
              Recent Pending Verifications
            </h3>
            {stats.pendingReviews > 0 && (
              <button
                onClick={() => navigate("/mentor/reports")}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View all <ChevronRight size={12} />
              </button>
            )}
          </div>

          {recentPending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
              <CheckCircle size={36} className="text-green-400 mb-2" />
              <p className="text-sm font-medium text-gray-500">
                All caught up!
              </p>
              <p className="text-xs mt-1">No pending verifications right now.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentPending.map((log) => (
                <li
                  key={log._id}
                  onClick={() => navigate(`/mentor/reports/${log._id}`)}
                  className="flex items-center justify-between py-3 cursor-pointer hover:bg-amber-50 rounded-lg px-2 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs uppercase">
                      {log.studentId?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {log.studentId?.name || "Unknown Student"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.activity} &bull;{" "}
                        {new Date(log.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">
                    Pending
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-indigo-400 text-xs mt-4">
        &copy; 2025 EIT Practicum Tracker | Mentor Dashboard
      </footer>
    </div>
  );
}

/* Summary Card */
function SummaryCard({
  label,
  value,
  icon,
  colorClass,
  bgClass,
  borderClass,
  highlight,
  onClick,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, scale: 1.02 }}
      onClick={onClick}
      className={`cursor-pointer flex flex-col gap-3 p-5 rounded-2xl border shadow-sm transition ${bgClass} ${borderClass} ${
        highlight ? "ring-2 ring-amber-300 shadow-amber-100" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl bg-white shadow-sm ${colorClass}`}>
          {icon}
        </div>
        {highlight && (
          <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
            Action needed
          </span>
        )}
      </div>
      <div>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
        <p className="text-sm text-gray-600 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

/* Quick Action Button */
function QuickAction({ label, icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition ${color}`}
    >
      {icon}
      {label}
      <ChevronRight size={14} className="ml-auto opacity-70" />
    </button>
  );
}
