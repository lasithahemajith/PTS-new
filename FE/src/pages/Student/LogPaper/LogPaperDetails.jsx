import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  BookOpenCheck,
  AlignLeft,
  Paperclip,
  MessageSquare,
  GraduationCap,
  BadgeCheck,
} from "lucide-react";

const STATUS_STYLES = {
  Verified: "bg-green-100 text-green-700 border border-green-200",
  Reviewed: "bg-blue-100  text-blue-700  border border-blue-200",
  Pending:  "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

const ACTIVITY_COLORS = {
  Observation:          "bg-violet-100 text-violet-700",
  Documentation:        "bg-sky-100    text-sky-700",
  "Case Discussion":    "bg-pink-100   text-pink-700",
  Supervision:          "bg-teal-100   text-teal-700",
  "Client Interaction": "bg-orange-100 text-orange-700",
  Assessment:           "bg-rose-100   text-rose-700",
};

function InfoRow({ icon: Icon, label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 flex-shrink-0">
        <Icon size={15} className="text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  );
}

export default function LogPaperDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await API.get(`/logpaper/${id}`);
        if (!active) return;
        setLog(data);
        const fbRes = await API.get(`/api/tutor-feedback/${id}`);
        if (active) setFeedbacks(Array.isArray(fbRes.data) ? fbRes.data : []);
      } catch (err) {
        console.error("Error fetching log or tutor feedbacks:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );

  if (!log)
    return (
      <div className="p-6 text-red-600 font-medium flex items-center gap-2">
        <span>⚠️</span> Log not found
      </div>
    );

  const statusStyle  = STATUS_STYLES[log.status]  || STATUS_STYLES.Pending;
  const actColor     = ACTIVITY_COLORS[log.activity] || "bg-gray-100 text-gray-600";

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-[calc(100vh-90px)]">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-5 transition"
      >
        <ArrowLeft size={15} /> Back to My Logs
      </button>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-5 max-w-2xl"
      >
        {/* ── Main card ── */}
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🗒</span>
              <h2 className="text-white font-bold text-lg">Practicum Log Entry</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle}`}>
                {log.status}
              </span>
            </div>
          </div>

          {/* Card body */}
          <div className="px-6 py-4">
            {/* Activity badge */}
            <div className="mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${actColor}`}>
                <BookOpenCheck size={13} />
                {log.activity || "—"}
              </span>
            </div>

            <InfoRow icon={CalendarDays}     label="Date"        value={new Date(log.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
            <InfoRow icon={Clock}            label="Total Hours" value={log.totalHours != null ? `${log.totalHours} hours` : null} />
            <InfoRow icon={AlignLeft}        label="Description" value={log.description} />

            {/* Attachments */}
            {log.attachments?.length > 0 && (
              <div className="flex items-start gap-3 py-3">
                <Paperclip size={15} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Attachments</p>
                  <ul className="space-y-1">
                    {log.attachments.map((a, i) => (
                      <li key={i}>
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <Paperclip size={12} /> {a.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Mentor comment ── */}
        <div className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-3 bg-blue-50 border-b border-blue-100">
            <MessageSquare size={15} className="text-blue-500" />
            <h3 className="font-semibold text-blue-700 text-sm">Mentor Comment</h3>
          </div>
          <div className="px-6 py-4">
            {log.mentorComment ? (
              <p className="text-gray-700 text-sm leading-relaxed">{log.mentorComment}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">No mentor comment yet.</p>
            )}
          </div>
        </div>

        {/* ── Tutor feedbacks ── */}
        <div className="bg-white rounded-2xl shadow-md border border-green-100 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-3 bg-green-50 border-b border-green-100">
            <GraduationCap size={15} className="text-green-600" />
            <h3 className="font-semibold text-green-700 text-sm">Tutor Feedback</h3>
          </div>
          <div className="px-6 py-4">
            {feedbacks.length > 0 ? (
              <ul className="space-y-3">
                {feedbacks.map((fb, i) => (
                  <li key={i} className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{fb.feedback}</p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <BadgeCheck size={11} className="text-green-500" />
                      {fb.tutorName || "Tutor"} · {new Date(fb.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">No tutor feedback yet.</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
