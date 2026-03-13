import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/NavBar";
import SessionTimeoutModal from "@/components/SessionTimeoutModal";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout() {
  const { logout, showTimeoutWarning, warningSecondsRemaining, dismissTimeoutWarning } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Session timeout warning modal */}
      {showTimeoutWarning && (
        <SessionTimeoutModal
          secondsRemaining={warningSecondsRemaining}
          onStayLoggedIn={dismissTimeoutWarning}
          onLogout={handleLogout}
        />
      )}

      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <Navbar onLogout={handleLogout} onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
