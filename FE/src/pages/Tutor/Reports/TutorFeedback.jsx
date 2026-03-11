import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "@/api/axios";

export default function TutorFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [log, setLog] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReviewedSuccess, setShowReviewedSuccess] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // 1️⃣ Fetch log details
        const logRes = await API.get(`/logpaper/${id}`);
        if (!active) return;
        setLog(logRes.data);

        // 2️⃣ Fetch tutor feedbacks
        const fbRes = await API.get(`/api/tutor-feedback/${id}`);
        if (active) setFeedbacks(fbRes.data || []);
      } catch (err) {
        console.error("Error fetching log or feedbacks:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  // ✅ Add Tutor Feedback
  const handleSubmit = async () => {
    try {
      await API.patch(`/api/tutor-feedback/${id}`, { feedback });
      setFeedback("");
      setShowSuccess(true);

      // Refresh feedback list
      const fbRes = await API.get(`/api/tutor-feedback/${id}`);
      setFeedbacks(fbRes.data || []);

      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("❌ Error submitting feedback");
    }
  };

  // ✅ Mark Reviewed
  const handleMarkReviewed = async () => {
    try {
      await API.patch(`/api/tutor-feedback/reviewed/${id}`);
      setShowReviewedSuccess(true);

      setTimeout(() => {
        setShowReviewedSuccess(false);
        navigate("/tutor/reports");
      }, 2000);
    } catch (err) {
      console.error("Error marking reviewed:", err);
      alert("Error marking reviewed.");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!log) return <p className="p-6 text-red-600">No log found.</p>;

  const isPending = log.status === "Pending";
  const isVerified = log.status === "Verified";
  const isReviewed = log.status === "Reviewed";

  // Split latest vs older feedbacks
  const latestFeedback = feedbacks.length > 0 ? feedbacks[0] : null;
  const olderFeedbacks = feedbacks.slice(1);

  return (
    <motion.div
      className="relative p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button
        onClick={() => navigate("/tutor/reports")}
        className="text-sm text-indigo-600 hover:underline mb-4"
      >
        ← Back to Reports
      </button>

      <h2 className="text-2xl font-bold text-indigo-800 mb-6">
        Tutor Feedback
      </h2>

      {/* 🧾 Student Log */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
        <h3 className="text-lg font-semibold text-indigo-800 mb-3">
          🧾 Student Log
        </h3>
        <p><strong>Student ID:</strong> {log.studentId}</p>
        <p><strong>Date:</strong> {new Date(log.date).toLocaleDateString()}</p>
        <p><strong>Activity:</strong> {log.activity}</p>
        <p><strong>Description:</strong> {log.description}</p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isPending
                ? "bg-yellow-100 text-yellow-700"
                : isVerified
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {log.status}
          </span>
        </p>
      </div>

      {/* 👨‍🏫 Mentor Feedback */}
      {log.mentorComment ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-6">
          <h3 className="font-semibold text-green-700 mb-2">
            👨‍🏫 Mentor Feedback
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {log.mentorComment}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {log.updatedAt ? new Date(log.updatedAt).toLocaleString() : ""}
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-5 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-1">
            👨‍🏫 Mentor Feedback
          </h3>
          <p className="text-sm text-yellow-700">
            ⚠️ Mentor feedback not yet provided. The log is still awaiting verification.
          </p>
        </div>
      )}

      {/* 🧑‍🏫 Tutor Feedback Section */}
      {latestFeedback && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-indigo-700 mb-3">
            🧑‍🏫 Latest Tutor Feedback
          </h3>
          <div className="bg-white p-3 rounded-lg border border-indigo-100">
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {latestFeedback.feedback}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(latestFeedback.createdAt).toLocaleString()}
            </p>
          </div>

          {/* 🔽 Expand older feedbacks */}
          {olderFeedbacks.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-indigo-600 text-sm hover:underline"
              >
                {showAll
                  ? "Hide older feedbacks ▲"
                  : `Show ${olderFeedbacks.length} older feedback${
                      olderFeedbacks.length > 1 ? "s" : ""
                    } ▼`}
              </button>

              <AnimatePresence>
                {showAll && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-3 overflow-hidden"
                  >
                    {olderFeedbacks.map((fb, idx) => (
                      <div
                        key={fb._id || idx}
                        className="bg-white p-3 rounded-lg border border-indigo-100"
                      >
                        <p className="text-sm text-gray-800 whitespace-pre-line">
                          {fb.feedback}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(fb.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* ✏️ Add New Feedback */}
      {!isReviewed && (
        <div className="bg-white border border-indigo-200 rounded-lg p-5 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-indigo-800">
            {isPending
              ? "Add Tutor Feedback"
              : "Update Tutor Feedback (Verified Log)"}
          </h3>

          <textarea
            className="w-full border border-indigo-200 rounded p-3 mb-3 focus:ring focus:ring-indigo-200 focus:outline-none"
            rows="4"
            placeholder="Enter your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
          >
            Submit Feedback
          </button>
        </div>
      )}

      {/* ✅ Mark as Reviewed Button */}
      {isVerified && (
        <div className="mt-6">
          <button
            onClick={handleMarkReviewed}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow-md"
          >
            ✅ Mark as Reviewed
          </button>
        </div>
      )}

      {/* 🎉 Feedback Success Popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          >
            <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-sm">
              <h3 className="text-2xl font-semibold text-green-600 mb-3">
                ✅ Feedback Submitted!
              </h3>
              <p className="text-gray-600">
                Your tutor feedback has been recorded successfully.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎯 Reviewed Success Popup */}
      <AnimatePresence>
        {showReviewedSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          >
            <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-sm">
              <h3 className="text-2xl font-semibold text-blue-600 mb-3">
                🎉 Log Marked as Reviewed!
              </h3>
              <p className="text-gray-600">
                This practicum log has been successfully marked as reviewed.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
