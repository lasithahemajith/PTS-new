import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

export default function ChangePassword() {
  const { markPasswordChanged } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/users/change-password", { newPassword });
      toast.success("✅ Password changed successfully!");
      markPasswordChanged();
      navigate("/home");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white/30 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-[420px] border border-white/30"
      >
        <h2 className="text-2xl font-bold text-center text-white drop-shadow-lg mb-2">
          Change Your Password
        </h2>
        <p className="text-center text-white/80 text-sm mb-6">
          For security, you must set a new password before continuing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-blue-700" size={20} />
            <input
              type="password"
              placeholder="New Password (min 6 characters)"
              value={newPassword}
              required
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/70 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-blue-700" size={20} />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/70 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 shadow-md"
          >
            {loading ? "Saving..." : "Set New Password"}
          </motion.button>
        </form>

        <p className="text-sm text-center text-white mt-6 opacity-80">
          Practicum Support | EIT © 2025
        </p>
      </motion.div>
    </div>
  );
}
