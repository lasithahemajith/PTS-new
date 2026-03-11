import React, { useState } from "react";
import { Outlet, useParams, useLocation } from "react-router-dom";
import HistoryLogs from "./HistoryLogs";
import AttendanceOverview from "./AttendanceOverview";

/**
 * When the URL matches /tutor/reports/:id we render the Outlet (TutorFeedback)
 * and hide the tabs. Otherwise, show the tabbed history dashboard.
 */
export default function ReportsTabs() {
  const { id } = useParams();
  const location = useLocation();
  const isDetails = /\/tutor\/reports\/[^/]+$/.test(location.pathname);

  if (isDetails && id) {
    return (
      <div className="p-4">
        <Outlet />
      </div>
    );
  }

  const tabs = [
    { key: "history", label: "History Logs", component: <HistoryLogs /> },
  //  { key: "summary", label: "Summary Reports", component: <div>Coming soon…</div> },
    { key: "attendance", label: "Attendance Overview", component: <AttendanceOverview /> },
  ];

  const [activeTab, setActiveTab] = useState("history");

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Reports</h2>

      {/* Tabs Header */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 rounded-lg border text-sm transition
              ${
                activeTab === tab.key
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
        {tabs.find((t) => t.key === activeTab)?.component}
      </div>
    </div>
  );
}
