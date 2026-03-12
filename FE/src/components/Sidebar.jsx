import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ClipboardList,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getInitials, roleAvatarBg } from "@/utils/roleColors";


export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openAttendance, setOpenAttendance] = useState(false);

  let navItems = [];

  if (user?.role === "Tutor") {
    navItems = [
      { label: "Home", path: "/tutor/home", icon: <Home size={18} /> },
      { label: "Users", path: "/tutor/users", icon: <User size={18} /> },
      { label: "Reports", path: "/tutor/reports", icon: <FileText size={18} /> },
      { label: "Dashboards", path: "/tutor/dashboards", icon: <BarChart3 size={18} /> },
    ];
  } else if (user?.role === "Mentor") {
    navItems = [
      { label: "Home", path: "/mentor/home", icon: <Home size={18} /> },
      { label: "Students", path: "/mentor/students", icon: <Users size={18} /> },
      { label: "Log Reports", path: "/mentor/reports", icon: <FileText size={18} /> },
      { label: "Attendance", path: "/mentor/attendance", icon: <ClipboardList size={18} /> },
    ];
  } else if (user?.role === "Student") {
    navItems = [
      { label: "Home", path: "/student/home", icon: <Home size={18} /> },
      { label: "My Logs", path: "/student/logpapers", icon: <ClipboardList size={18} /> },
      { label: "Attendance", path: "/student/attendance", icon: <ClipboardList size={18} /> },
    ];
  }

  const avatarBg = roleAvatarBg[user?.role] || "bg-indigo-400";

  return (
    <motion.aside
      animate={{ width: collapsed ? 70 : 230 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-b from-indigo-900 to-indigo-800 text-white flex flex-col shadow-2xl h-screen sticky top-0 overflow-hidden"
    >
      {/* Logo / Brand */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-indigo-700/60">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold text-white">
              EIT
            </div>
            <span className="text-sm font-bold text-white/90 tracking-wide">PTS</span>
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-indigo-700 transition ml-auto"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </div>

      {/* User Info */}
      <div className={`flex items-center gap-3 px-3 py-4 border-b border-indigo-700/60 ${collapsed ? "justify-center" : ""}`}>
        <div
          className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold text-white shadow-md ${avatarBg}`}
        >
          {getInitials(user?.name)}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {user?.name || "User"}
            </p>
            <span className="text-xs text-indigo-300">{user?.role}</span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-indigo-800">
        {navItems.map((item) => {
          // Regular items
          if (!item.subItems) {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-indigo-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div
                  className={`p-1.5 rounded-md transition flex-shrink-0 ${
                    isActive ? "bg-white/20" : "bg-transparent group-hover:bg-white/10"
                  }`}
                >
                  {item.icon}
                </div>
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full opacity-70" />
                )}
              </Link>
            );
          }

          // Submenu (Attendance)
          const isAttendanceActive = item.subItems.some((sub) =>
            location.pathname.startsWith(sub.path)
          );

          return (
            <div key={item.label}>
              <button
                onClick={() => setOpenAttendance(!openAttendance)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isAttendanceActive
                    ? "bg-white/15 text-white"
                    : "text-indigo-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-md transition ${
                      isAttendanceActive ? "bg-white/20" : "bg-transparent group-hover:bg-white/10"
                    }`}
                  >
                    {item.icon}
                  </div>
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && (openAttendance ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>

              {/* Sub-items */}
              <AnimatePresence>
                {openAttendance && !collapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-8 mt-1 space-y-1 overflow-hidden"
                  >
                    {item.subItems.map((sub) => {
                      const active = location.pathname === sub.path;
                      return (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`block px-3 py-1.5 rounded-md text-sm ${
                            active
                              ? "bg-white/15 text-white"
                              : "text-indigo-300 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      <div className="p-3 text-center border-t border-indigo-700/60 text-xs text-indigo-400">
        {!collapsed && <p className="opacity-60">EIT Practicum &copy; 2025</p>}
      </div>
    </motion.aside>
  );
}
