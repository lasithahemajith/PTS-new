import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, BookOpen } from "lucide-react";
import AddLogPaper from "@/pages/Student/LogPaper/AddLogPaper";
import LogPaperList from "@/pages/Student/LogPaper/LogPaperList";

const TABS = [
  { key: "add",     label: "Add Log",      icon: PlusCircle },
  { key: "history", label: "History Logs", icon: BookOpen   },
];

export default function LogPaperTabs() {
  const [activeTab, setActiveTab] = useState("add");

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-indigo-50 via-white to-indigo-100 rounded-2xl border border-indigo-100 shadow-inner overflow-hidden">
      {/* Page header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 px-8 py-6">
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3"
        >
          <span className="text-3xl">🧾</span>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Practicum Logs</h1>
            <p className="text-indigo-200 text-sm mt-0.5">Track and manage your practicum activities</p>
          </div>
        </motion.div>

        {/* Pill tabs */}
        <div className="flex gap-2 mt-5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${
                activeTab === key
                  ? "bg-white text-indigo-700 shadow-md"
                  : "text-indigo-100 hover:text-white hover:bg-white/20"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Animated content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          {activeTab === "add" ? <AddLogPaper /> : <LogPaperList />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
