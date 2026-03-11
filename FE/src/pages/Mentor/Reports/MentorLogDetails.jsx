import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api/axios";

export default function MentorLogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [log, setLog] = useState(null);
  const [comment, setComment] = useState("");
  const [feedbacks, setFeedbacks] = useState([]); // tutor feedbacks
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // 🔹 Load the student log details and tutor feedbacks
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await API.get(`/logpaper/${id}`);
        if (!mounted) return;
        setLog(data);
        if (data.mentorComment) setComment(data.mentorComment);

        // fetch tutor feedbacks
        const fbRes = await API.get(`/api/tutor-feedback/${id}`);
        if (mounted && Array.isArray(fbRes.data)) setFeedbacks(fbRes.data);
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

  // 🔹 Submit mentor verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.patch(`/logpaper/${id}/verify`, {
        mentorComment: comment,
      });
      setLog(res.data.updated);
      setSubmitted(true);
    } catch (err) {
      console.error("Verify error:", err);
      alert("Failed to verify log");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!log) return <div className="p-6 text-red-600">Log not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-indigo-600 hover:underline"
      >
        ← Back to Reports
      </button>

      {/* 🧾 Student Log Details */}
      <div className="bg-white border rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-indigo-700">
          Practicum Log Details
        </h2>

        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Student ID:</strong> {log.studentId}</p>
          <p><strong>Date:</strong> {new Date(log.date).toLocaleDateString()}</p>
          <p><strong>Activity:</strong> {log.activity}</p>
          <p><strong>Total Hours:</strong> {log.totalHours ?? "-"}</p>
          <p><strong>Description:</strong> {log.description}</p>

          {log.attachments?.length > 0 && (
            <div>
              <strong>Attachments:</strong>
              <ul className="list-disc list-inside">
                {log.attachments.map((a, i) => (
                  <li key={i}>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {a.filename}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Tutor Feedback Highlight for Pending Stage */}
      {log.status === "Pending" && feedbacks.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-300 rounded-xl shadow p-6">
          <h3 className="font-semibold mb-2 text-blue-800">
            Tutor Feedback (For Mentor Reference)
          </h3>
          <ul className="space-y-3">
            {feedbacks.map((fb, i) => (
              <li
                key={fb._id || i}
                className="p-3 border border-blue-200 rounded-lg bg-white text-sm text-gray-800 shadow-sm"
              >
                <p className="whitespace-pre-line">{fb.feedback}</p>
                <p className="text-xs text-blue-700 mt-1">
                  — {fb.tutorName ? `Reviewed by ${fb.tutorName} ` : ""}
                  on {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : "-"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🧠 Mentor Feedback or Verified View */}
      {log.status === "Pending" && !submitted ? (
        <div className="bg-white border rounded-xl shadow p-6">
          <h3 className="font-semibold mb-3 text-indigo-700">
            Mentor Verification
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your feedback or verification notes..."
              required
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              rows={4}
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm"
            >
              ✅ Submit Verification
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl shadow p-6">
          <h3 className="font-semibold mb-2 text-green-700">
            Mentor Feedback (Verified)
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {log.mentorComment || comment || "—"}
          </p>
          <p className="mt-3 text-xs text-green-600">
            ✅ This log has been verified and is locked for editing.
          </p>
        </div>
      )}

      {/* 📋 Tutor Feedback after Verification */}
      {log.status !== "Pending" && (
        <div className="bg-white border rounded-xl shadow p-6">
          <h3 className="font-semibold mb-3 text-indigo-700">Tutor Feedback</h3>
          {feedbacks && feedbacks.length > 0 ? (
            <ul className="space-y-3">
              {feedbacks.map((fb, i) => (
                <li
                  key={fb._id || i}
                  className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700"
                >
                  <p className="whitespace-pre-line">{fb.feedback}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    — {fb.tutorName ? `Reviewed by ${fb.tutorName} ` : ""}
                    on {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : "-"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No tutor feedback yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
