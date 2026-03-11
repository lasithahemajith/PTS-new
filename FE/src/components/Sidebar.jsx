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
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

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

  return (
    <motion.aside
      animate={{ width: collapsed ? 70 : 230 }}
      transition={{ duration: 0.3 }}
      className="bg-indigo-800 text-white flex flex-col shadow-2xl h-screen sticky top-0 overflow-hidden"
    >
      {/* Collapse Button */}
      <div className="flex justify-end items-center p-3 border-b border-indigo-700">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-indigo-700 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
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
                className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                }`}
              >
                <div
                  className={`p-1.5 rounded-md transition ${
                    isActive ? "bg-white/20" : "bg-transparent group-hover:bg-white/10"
                  }`}
                >
                  {item.icon}
                </div>
                {!collapsed && <span>{item.label}</span>}
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isAttendanceActive
                    ? "bg-indigo-600 text-white"
                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
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
              {openAttendance && !collapsed && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems.map((sub) => {
                    const active = location.pathname === sub.path;
                    return (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className={`block px-3 py-1.5 rounded-md text-sm ${
                          active
                            ? "bg-indigo-700 text-white"
                            : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 text-center border-t border-indigo-700 text-xs text-indigo-200">
        {!collapsed && <p className="opacity-70">EIT Practicum © 2025</p>}
      </div>
    </motion.aside>
  );
}
