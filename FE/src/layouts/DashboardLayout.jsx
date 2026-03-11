import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Auto-collapse sidebar when scrolling down
  useEffect(() => {
    let lastScrollTop = 0;
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsCollapsed(scrollTop > lastScrollTop && scrollTop > 50); // collapse when scrolling down
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} collapsed={isCollapsed} />

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full">
        <Navbar onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
