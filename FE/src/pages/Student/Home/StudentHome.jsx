import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Clock, UserCheck, CheckCircle, AlertCircle, BookOpen, TrendingUp, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import API from "@/api/axios";

export default function StudentHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentLogs, setRecentLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, reviewed: 0, hours: 0 });
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/logpaper/my");
        const logs = res.data || [];
        const total = logs.length;
        const pending = logs.filter((l) => l.status === "Pending").length;
        const verified = logs.filter((l) => l.status === "Verified").length;
        const reviewed = logs.filter((l) => l.status === "Reviewed").length;
        const hours = logs.reduce((sum, l) => sum + (parseFloat(l.totalHours) || 0), 0);
        setStats({ total, pending, verified, reviewed, hours: hours.toFixed(1) });
        setRecentLogs(logs.slice(0, 5));
      } catch (err) {
        console.error("Failed to load logs:", err);
      } finally {
        setLoadingLogs(false);
      }
    })();
  }, []);

  const activityColors = {
    Observation: "bg-purple-100 text-purple-700",
    Documentation: "bg-blue-100 text-blue-700",
    "Case Discussion": "bg-orange-100 text-orange-700",
    Supervision: "bg-teal-100 text-teal-700",
    "Client Interaction": "bg-pink-100 text-pink-700",
    Assessment: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* Welcome Banner */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white shadow-lg"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-1">
                  👋 Welcome back, {user?.name?.split(" ")[0] || "Student"}!
                </h2>
                <p className="text-indigo-100 text-sm md:text-base">
                  Track your practicum journey — log activities, mark attendance, and stay on top of your progress.
                </p>
              </div>
              <div className="hidden md:flex items-center justify-center w-16 h-16 bg-white/20 rounded-full">
                <BookOpen size={32} className="text-white" />
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Logs", value: stats.total, icon: <ClipboardList size={20} />, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Total Hours", value: stats.hours, icon: <Clock size={20} />, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Verified", value: stats.verified, icon: <CheckCircle size={20} />, color: "text-green-600", bg: "bg-green-50" },
              { label: "Pending", value: stats.pending, icon: <AlertCircle size={20} />, color: "text-yellow-600", bg: "bg-yellow-50" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`${s.bg} rounded-xl p-4 flex flex-col gap-2 shadow-sm border border-white`}
              >
                <div className={`${s.color} flex items-center gap-2`}>
                  {s.icon}
                  <span className="text-xs font-medium text-gray-500">{s.label}</span>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <DashboardCard
              icon={<Clock size={28} />}
              title="Add Practicum Log"
              desc="Record your daily practicum activities, reflections, and hours completed."
              color="from-indigo-500 to-purple-600"
              action={() => navigate("/student/logpapers")}
            />
            <DashboardCard
              icon={<MapPin size={28} />}
              title="Mark Attendance"
              desc="Mark your attendance for today — Class or Practicum — with GPS location."
              color="from-blue-500 to-cyan-500"
              action={() => navigate("/student/attendance")}
            />
          </div>

          {/* Recent Activities */}
          <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
            <ClipboardList size={20} /> Recent Activities
          </h3>
          {loadingLogs ? (
            <div className="flex items-center gap-3 text-gray-400 py-6">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-400"></span>
              Loading recent logs...
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-dashed border-indigo-200 text-gray-400">
              <ClipboardList size={36} className="mx-auto mb-3 text-indigo-200" />
              <p className="font-medium">No logs yet.</p>
              <p className="text-sm mt-1">Start by adding your first practicum log!</p>
              <button
                onClick={() => navigate("/student/logpapers")}
                className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
              >
                Add First Log
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log, i) => (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => navigate(`/student/logpapers/${log._id}`)}
                  className="cursor-pointer bg-white rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm border border-indigo-50 hover:border-indigo-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <BookOpen size={18} className="text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-indigo-800 text-sm truncate">{log.activity}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(log.date).toLocaleDateString()} · {log.totalHours ?? "-"} hrs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      activityColors[log.activity] || "bg-gray-100 text-gray-600"
                    }`}>
                      {log.activity}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      log.status === "Verified" ? "bg-green-100 text-green-700" :
                      log.status === "Reviewed" ? "bg-blue-100 text-blue-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </motion.div>
              ))}
              {stats.total > 5 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => navigate("/student/logpapers")}
                    className="text-indigo-600 text-sm hover:underline font-medium"
                  >
                    View all {stats.total} logs →
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-indigo-500 text-xs opacity-70 border-t border-indigo-100">
          © 2025 EIT Practicum Tracker | Student Dashboard
        </footer>
      </div>
    </div>
  );
}

/* 🔹 Reusable DashboardCard Component */
function DashboardCard({ icon, title, desc, color, action }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={action}
      className={`cursor-pointer bg-gradient-to-r ${color} text-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition`}
    >
      <div>
        <div className="mb-3 p-2 bg-white/20 rounded-xl w-fit">{icon}</div>
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-sm opacity-90 leading-relaxed">{desc}</p>
      </div>
      <button
        onClick={action}
        className="mt-5 bg-white/20 hover:bg-white/30 text-sm font-semibold px-4 py-2 rounded-md transition w-fit"
      >
        Open →
      </button>
    </motion.div>
  );
}
