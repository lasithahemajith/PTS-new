import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Layout
import DashboardLayout from "@/layouts/DashboardLayout";

// Auth
import Login from "@/pages/Auth/Login";

// STUDENT
import StudentHome from "@/pages/Student/Home/StudentHome";
import LogPaperTabs from "@/pages/Student/LogPaper/LogPaperTabs";
import LogPaperDetails from "@/pages/Student/LogPaper/LogPaperDetails";
import AttendanceTabs from "@/pages/Student/Attendance/AttendanceTabs";

// MENTOR
import MentorHome from "@/pages/Mentor/Home/MentorHome";
import MentorStudents from "@/pages/Mentor/MentorStudents";
import MentorReports from "@/pages/Mentor/Reports/MentorReports";
import MentorLogDetails from "@/pages/Mentor/Reports/MentorLogDetails";
import MentorAttendance from "@/pages/Mentor/MentorAttendance";

// TUTOR
import TutorHome from "@/pages/Tutor/Home/TutorHome";
import UserTabs from "@/pages/Tutor/Users/UserTabs";
import ReportsTabs from "@/pages/Tutor/Reports/ReportsTabs";
import TutorFeedback from "@/pages/Tutor/Reports/TutorFeedback";
import TutorDashboardTabs from "@/pages/Tutor/Dashboards/TutorDashboardTabs";

/* -------------------------------------------------------------
   🔐 Protected Route Wrapper
------------------------------------------------------------- */
function ProtectedRoute({ children, allowedRoles }) {
  const { token, user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If logged in but not allowed for this page → redirect to their own dashboard
    if (user?.role === "Student") return <Navigate to="/student/home" replace />;
    if (user?.role === "Mentor") return <Navigate to="/mentor/home" replace />;
    if (user?.role === "Tutor") return <Navigate to="/tutor/home" replace />;
  }

  return children;
}

/* -------------------------------------------------------------
   🌐 App Routes
------------------------------------------------------------- */
export default function AppRoutes() {
  const { token, user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // ✅ Determine default redirect after login
  const getHomeRoute = () => {
    if (!user) return "/login";
    if (user.role === "Student") return "/student/home";
    if (user.role === "Mentor") return "/mentor/home";
    if (user.role === "Tutor") return "/tutor/home";
    return "/login";
  };

  return (
    <Routes>
      {/* ---------- PUBLIC ROUTE ---------- */}
      <Route
        path="/login"
        element={!token ? <Login /> : <Navigate to={getHomeRoute()} replace />}
      />

      {/* ---------- PROTECTED LAYOUT ---------- */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* ---------- STUDENT ROUTES ---------- */}
        <Route
          path="student/home"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <StudentHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/logpapers"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <LogPaperTabs />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/logpapers/:id"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <LogPaperDetails />
            </ProtectedRoute>
          }
        />
        
        <Route path="/student/attendance" element={<AttendanceTabs />} />



        {/* ---------- MENTOR ROUTES ---------- */}
        <Route
          path="mentor/home"
          element={
            <ProtectedRoute allowedRoles={["Mentor"]}>
              <MentorHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="mentor/students"
          element={
            <ProtectedRoute allowedRoles={["Mentor"]}>
              <MentorStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="mentor/reports"
          element={
            <ProtectedRoute allowedRoles={["Mentor"]}>
              <MentorReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="mentor/reports/:id"
          element={
            <ProtectedRoute allowedRoles={["Mentor"]}>
              <MentorLogDetails />
            </ProtectedRoute>
          }
        />
        <Route path="/mentor/attendance" element={<MentorAttendance />} />

        {/* ---------- TUTOR ROUTES ---------- */}
        <Route
          path="tutor/home"
          element={
            <ProtectedRoute allowedRoles={["Tutor"]}>
              <TutorHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="tutor/users"
          element={
            <ProtectedRoute allowedRoles={["Tutor"]}>
              <UserTabs />
            </ProtectedRoute>
          }
        />
        <Route
          path="tutor/reports"
          element={
            <ProtectedRoute allowedRoles={["Tutor"]}>
              <ReportsTabs />
            </ProtectedRoute>
          }
        >
          <Route
            path=":id"
            element={
              <ProtectedRoute allowedRoles={["Tutor"]}>
                <TutorFeedback />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/tutor/dashboards" element={<TutorDashboardTabs />} />

      </Route>

      {/* ---------- FALLBACK ---------- */}
      <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
    </Routes>
  );
}
