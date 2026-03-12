import { useState } from "react";
import API from "@/api/axios";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  CalendarDays,
  Clock3,
  ClockArrowUp,
  Hourglass,
  BookOpenCheck,
  AlignLeft,
  Paperclip,
} from "lucide-react";

const ACTIVITIES = [
  "Observation",
  "Documentation",
  "Case Discussion",
  "Supervision",
  "Client Interaction",
  "Assessment",
];

const ACTIVITY_ICONS = {
  Observation: "👁",
  Documentation: "📄",
  "Case Discussion": "💬",
  Supervision: "🎓",
  "Client Interaction": "🤝",
  Assessment: "📋",
};

function FieldLabel({ icon: Icon, children }) {
  return (
    <label className="flex items-center gap-1.5 text-gray-700 font-medium mb-1.5 text-sm">
      <Icon size={14} className="text-indigo-400" />
      {children}
    </label>
  );
}

export default function AddLogPaper() {
  const today = new Date().toISOString().split("T")[0];

  const emptyForm = {
    date: today,
    startTime: "",
    endTime: "",
    totalHours: "",
    activity: "",
    description: "",
    attachments: null,
  };

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const calculateHours = (start, end) => {
    if (!start || !end) return "";
    const s = new Date(`1970-01-01T${start}:00`);
    const e = new Date(`1970-01-01T${end}:00`);
    const diff = (e - s) / (1000 * 60 * 60);
    return diff > 0 ? diff.toFixed(2) : "";
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachments") {
      setForm((f) => ({ ...f, attachments: files }));
    } else if (name === "startTime" || name === "endTime") {
      setForm((f) => {
        const updated = { ...f, [name]: value };
        updated.totalHours = calculateHours(updated.startTime, updated.endTime);
        return updated;
      });
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "attachments" && value) {
          Array.from(value).forEach((file) => data.append("attachments", file));
        } else {
          data.append(key, value);
        }
      });
      await API.post("/logpaper", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm(emptyForm);
      Swal.fire({
        icon: "success",
        title: "Log Added! ✅",
        text: "Your practicum entry has been recorded.",
        timer: 2200,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.response?.data?.error || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-6"
    >
      <div className="bg-white shadow-lg rounded-2xl border border-indigo-100 overflow-hidden max-w-3xl mx-auto">
        {/* Form header */}
        <div className="bg-indigo-50 border-b border-indigo-100 px-7 py-4">
          <h2 className="text-lg font-bold text-indigo-800 flex items-center gap-2">
            <span className="text-2xl">✏️</span> New Practicum Log Entry
          </h2>
          <p className="text-sm text-indigo-500 mt-0.5">Fill in the details for today's session</p>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-6">
          {/* ── Date & Time row ── */}
          <div>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
              Session Details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <FieldLabel icon={CalendarDays}>Date</FieldLabel>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  max={today}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50"
                />
                <p className="text-[11px] text-gray-400 mt-1">Today or past dates only</p>
              </div>
              <div>
                <FieldLabel icon={Clock3}>Start Time</FieldLabel>
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50"
                />
              </div>
              <div>
                <FieldLabel icon={ClockArrowUp}>End Time</FieldLabel>
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50"
                />
              </div>
            </div>

            {/* Total hours pill */}
            {form.totalHours && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-indigo-200">
                <Hourglass size={13} />
                {form.totalHours} hours calculated
              </div>
            )}
          </div>

          {/* ── Activity ── */}
          <div>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
              Activity
            </p>
            <FieldLabel icon={BookOpenCheck}>Activity Type</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACTIVITIES.map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, activity: act }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    form.activity === act
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  <span>{ACTIVITY_ICONS[act]}</span>
                  {act}
                </button>
              ))}
            </div>
          </div>

          {/* ── Description ── */}
          <div>
            <FieldLabel icon={AlignLeft}>Description</FieldLabel>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your work or learning experience…"
              required
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none bg-gray-50 resize-y"
            />
          </div>

          {/* ── Attachments ── */}
          <div>
            <FieldLabel icon={Paperclip}>Attachments</FieldLabel>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-xl p-5 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
              <Paperclip size={22} className="text-indigo-400 mb-1" />
              <span className="text-sm text-gray-500">
                {form.attachments && form.attachments.length > 0
                  ? `${form.attachments.length} file(s) selected`
                  : "Click to attach photo, PDF, or video"}
              </span>
              <input
                type="file"
                name="attachments"
                accept="image/*,application/pdf,video/*"
                multiple
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>

          {/* ── Submit ── */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl shadow-md transition-all text-sm tracking-wide"
            >
              {loading ? "Submitting…" : "Submit Log Entry"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

