import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Paperclip,
  MessageSquare,
  User,
  CalendarDays,
  BookOpen,
  Loader2,
} from "lucide-react";

export default function MentorLogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [log, setLog] = useState(null);
  const [comment, setComment] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await API.get(`/logpaper/${id}`);
        if (!mounted) return;
        setLog(data);
        if (data.mentorComment) setComment(data.mentorComment);

        try {
          const fbRes = await API.get(`/api/tutor-feedback/${id}`);
          if (mounted && Array.isArray(fbRes.data)) setFeedbacks(fbRes.data);
        } catch {
          // tutor feedback is optional
        }
      } catch (err) {
        console.error("Error loading log:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.patch(`/logpaper/${id}/verify`, {
        mentorComment: comment,
      });
      setLog(res.data.updated);
      setSubmitted(true);
    } catch (err) {
      console.error("Verify error:", err);
      alert("Failed to verify log. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
      </div>
    );

  if (!log)
    return (
      <div className="p-6 text-center text-red-600 font-medium">
        Log not found.
      </div>
    );

  const isPending = log.status === "Pending" && !submitted;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition"
      >
        <ArrowLeft size={15} />
        Back to Reports
      </button>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`flex items-center gap-3 p-4 rounded-2xl ${
          log.status === "Verified" || submitted
            ? "bg-green-50 border border-green-200"
            : "bg-amber-50 border border-amber-200"
        }`}
      >
        {log.status === "Verified" || submitted ? (
          <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
        ) : (
          <Clock size={20} className="text-amber-600 flex-shrink-0 animate-pulse" />
        )}
        <div>
          <p className={`text-sm font-semibold ${log.status === "Verified" || submitted ? "text-green-700" : "text-amber-700"}`}>
            {log.status === "Verified" || submitted
              ? "This log has been verified"
              : "This log is awaiting your verification"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Submitted by {log.studentId?.name || "student"} on{" "}
            {new Date(log.date).toLocaleDateString()}
          </p>
        </div>
      </motion.div>

      {/* Log Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6"
      >
        <h2 className="text-base font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <BookOpen size={16} />
          Practicum Log Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <InfoField
            icon={<User size={14} />}
            label="Student"
            value={log.studentId?.name || String(log.studentId)}
          />
          <InfoField
            icon={<CalendarDays size={14} />}
            label="Date"
            value={new Date(log.date).toLocaleDateString("en-NZ", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
          <InfoField
            icon={<BookOpen size={14} />}
            label="Activity"
            value={log.activity}
          />
          <InfoField
            icon={<Clock size={14} />}
            label="Total Hours"
            value={log.totalHours ?? "—"}
          />
        </div>

        {log.description && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Description
            </p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-line">
              {log.description}
            </p>
          </div>
        )}

        {log.attachments?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Paperclip size={12} />
              Attachments
            </p>
            <ul className="space-y-1">
              {log.attachments.map((a, i) => (
                <li key={i}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline text-sm flex items-center gap-1"
                  >
                    <Paperclip size={12} />
                    {a.filename}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* Tutor Feedback (when pending) */}
      {isPending && feedbacks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-blue-50 border-l-4 border-blue-400 rounded-2xl shadow-sm p-6"
        >
          <h3 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
            <MessageSquare size={15} />
            Tutor Feedback (For Your Reference)
          </h3>
          <ul className="space-y-3">
            {feedbacks.map((fb, i) => (
              <li
                key={fb._id || i}
                className="p-3 border border-blue-200 rounded-xl bg-white text-sm text-gray-800 shadow-sm"
              >
                <p className="whitespace-pre-line">{fb.feedback}</p>
                <p className="text-xs text-blue-600 mt-2">
                  &mdash;{" "}
                  {fb.tutorName ? `Reviewed by ${fb.tutorName} ` : ""}
                  on{" "}
                  {fb.createdAt
                    ? new Date(fb.createdAt).toLocaleString()
                    : "—"}
                </p>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Mentor Verification / Verified View */}
      {isPending ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6"
        >
          <h3 className="font-semibold mb-3 text-indigo-700 flex items-center gap-2">
            <CheckCircle size={15} />
            Mentor Verification
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your verification notes or feedback..."
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
              rows={4}
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <CheckCircle size={15} />
              )}
              {submitting ? "Submitting..." : "Submit Verification"}
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-green-50 border border-green-200 rounded-2xl shadow-sm p-6"
        >
          <h3 className="font-semibold mb-2 text-green-700 flex items-center gap-2">
            <CheckCircle size={15} />
            Mentor Feedback (Verified)
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-line bg-white rounded-xl p-3 border border-green-100">
            {log.mentorComment || comment || "—"}
          </p>
          <p className="mt-3 text-xs text-green-600 flex items-center gap-1">
            <CheckCircle size={12} />
            This log has been verified and is locked for editing.
          </p>
        </motion.div>
      )}

      {/* Tutor Feedback (after verification) */}
      {(log.status !== "Pending" || submitted) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6"
        >
          <h3 className="font-semibold mb-3 text-indigo-700 flex items-center gap-2">
            <MessageSquare size={15} />
            Tutor Feedback
          </h3>
          {feedbacks.length > 0 ? (
            <ul className="space-y-3">
              {feedbacks.map((fb, i) => (
                <li
                  key={fb._id || i}
                  className="p-3 border border-gray-100 rounded-xl bg-gray-50 text-sm text-gray-700"
                >
                  <p className="whitespace-pre-line">{fb.feedback}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    &mdash;{" "}
                    {fb.tutorName ? `Reviewed by ${fb.tutorName} ` : ""}
                    on{" "}
                    {fb.createdAt
                      ? new Date(fb.createdAt).toLocaleString()
                      : "—"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No tutor feedback available yet.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

function InfoField({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-indigo-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
          {label}
        </p>
        <p className="text-sm text-gray-800 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}
