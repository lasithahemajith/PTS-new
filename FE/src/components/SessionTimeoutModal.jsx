import { useEffect, useState } from "react";
import { Clock, LogOut, RefreshCw } from "lucide-react";

export default function SessionTimeoutModal({ secondsRemaining, onStayLoggedIn, onLogout }) {
  const [count, setCount] = useState(secondsRemaining);

  useEffect(() => {
    setCount(secondsRemaining);
  }, [secondsRemaining]);

  useEffect(() => {
    if (count <= 0) return;
    const interval = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const minutes = Math.floor(count / 60);
  const seconds = count % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-amber-100 rounded-full p-4">
            <Clock className="text-amber-600" size={32} />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Session Expiring Soon
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          You have been inactive. Your session will expire in
        </p>
        <div className="text-4xl font-mono font-bold text-amber-600 mb-6">
          {formatted}
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Click &quot;Stay Logged In&quot; to continue your session.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onStayLoggedIn}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            <RefreshCw size={16} />
            Stay Logged In
          </button>
          <button
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-semibold transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
