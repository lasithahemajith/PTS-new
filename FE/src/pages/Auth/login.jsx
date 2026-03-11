import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import API from "@/api/axios";
import { Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      console.log("Login response:", res.data);

      if (res.data.token && res.data.user) {
        toast.success("✅ Login successful! Redirecting...");
        login(res.data.user, res.data.token);
        navigate("/home");
      } else {
        toast.error("❌ Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.status === 401
          ? "Incorrect email or password"
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="bg-white/30 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-[400px] border border-white/30"
      >
        <h2 className="text-3xl font-bold text-center text-white drop-shadow-lg mb-6">
          Practicum Tracker
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-blue-700" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/70 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-blue-700" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Signing In..." : "Login"}
          </motion.button>
        </form>

        <p className="text-sm text-center text-white mt-6 opacity-80">
          Practicum Support | EIT © 2025
        </p>
      </motion.div>
    </div>
  );
}
