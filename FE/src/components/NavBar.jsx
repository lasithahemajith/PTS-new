import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function Navbar({ onLogout }) {
  const { user } = useAuth();

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-white/80 backdrop-blur-md shadow-md border-b border-indigo-100 px-8 py-4 flex justify-between items-center sticky top-0 z-40"
    >
      <h1 className="text-xl font-bold text-indigo-700 tracking-wide">
        Practicum Tracking System
      </h1>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-medium text-indigo-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-md transition"
        >
          <LogOut size={16} />
          Logout
        </motion.button>
      </div>
    </motion.nav>
  );
}
