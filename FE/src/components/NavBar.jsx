import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getInitials, roleAvatarBg } from "@/utils/roleColors";
import NotificationBell from "@/components/NotificationBell";



export default function Navbar({ onLogout }) {
  const { user } = useAuth();
  const avatarBg = roleAvatarBg[user?.role] || "bg-indigo-500";

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-white/90 backdrop-blur-md shadow-sm border-b border-indigo-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40"
    >
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">EIT</span>
        </div>
        <h1 className="text-base font-bold text-indigo-700 tracking-wide hidden sm:block">
          Practicum Tracking System
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        {/* User info + avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${avatarBg}`}>
            {getInitials(user?.name)}
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLogout}
          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow transition"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>
    </motion.nav>
  );
}
