import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api/axios";

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
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!log) return <div className="p-6 text-red-600">Log not found</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-[calc(100vh-90px)]">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-indigo-600 hover:underline mb-4"
      >
        ← Back to My Logs
      </button>

      <div className="bg-white shadow-xl rounded-2xl border border-indigo-100 p-6 mb-6">
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">
          🗒 Practicum Log Entry
        </h2>
        <div className="text-gray-700 space-y-2 text-sm">
          <p><strong>Date:</strong> {new Date(log.date).toLocaleDateString()}</p>
          <p><strong>Activity:</strong> {log.activity}</p>
          <p><strong>Total Hours:</strong> {log.totalHours ?? "-"}</p>
          <p><strong>Description:</strong> {log.description}</p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-2xl border border-blue-100 p-6 mb-6">
        <h3 className="font-semibold text-blue-700 mb-2">💬 Mentor Comment</h3>
        <p className="text-gray-700 text-sm">
          {log.mentorComment || <i>No comments yet.</i>}
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-2xl border border-green-100 p-6">
        <h3 className="font-semibold text-green-700 mb-2">🧑‍🏫 Tutor Feedback</h3>
        {feedbacks.length > 0 ? (
          <ul className="space-y-3">
            {feedbacks.map((fb, i) => (
              <li
                key={i}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 shadow-sm"
              >
                <p>{fb.feedback}</p>
                <p className="text-xs text-gray-500 mt-1">
                  — {fb.tutorName || "Tutor"} on{" "}
                  {new Date(fb.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">No tutor feedback yet.</p>
        )}
      </div>
    </div>
  );
}
