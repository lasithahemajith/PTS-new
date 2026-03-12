import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import API from "@/api/axios";
import { Lock, Mail, BookOpen, Sparkles } from "lucide-react";
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
        if (res.data.user.mustChangePassword) {
          navigate("/change-password");
        } else {
          navigate("/home");
        }
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

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-10 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-10 right-10 w-96 h-96 bg-white/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, -30, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/4 w-60 h-60 bg-blue-300/30 rounded-full blur-3xl"
      />

      {/* Spinning Lines and Dynamic Art */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Circular lines */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`circle-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute inset-0 m-auto"
            style={{
              width: `${300 + i * 120}px`,
              height: `${300 + i * 120}px`,
              border: "3px solid rgba(255, 255, 255, 0.4)",
              borderRadius: "50%",
            }}
          />
        ))}
      </motion.div>

      {/* Diagonal Spinning Lines */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 pointer-events-none"
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`line-${i}`}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            className="absolute bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{
              width: "200%",
              height: "3px",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
              transformOrigin: "center",
            }}
          />
        ))}
      </motion.div>

      {/* Grid Pattern */}
      <motion.div
        animate={{
          opacity: [0.1, 0.25, 0.1],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.2) 2px, transparent 2px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.2) 2px, transparent 2px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Floating Geometric Shapes */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`geo-${i}`}
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
          className="absolute pointer-events-none"
          style={{
            left: `${10 + i * 20}%`,
            top: `${15 + i * 15}%`,
          }}
        >
          <div
            className="bg-white/20 backdrop-blur-sm shadow-lg"
            style={{
              width: `${40 + i * 20}px`,
              height: `${40 + i * 20}px`,
              borderRadius: i % 2 === 0 ? "50%" : "10px",
              border: "3px solid rgba(255, 255, 255, 0.4)",
            }}
          />
        </motion.div>
      ))}

      {/* Radial Burst Lines */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 pointer-events-none"
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`burst-${i}`}
            animate={{
              scaleX: [1, 1.2, 1],
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="absolute bg-gradient-to-r from-white/30 via-white/10 to-transparent"
            style={{
              width: "50%",
              height: "2px",
              top: "50%",
              left: "50%",
              transformOrigin: "left center",
              transform: `rotate(${i * 30}deg)`,
            }}
          />
        ))}
      </motion.div>

      {/* Login Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white/20 backdrop-blur-xl shadow-2xl rounded-3xl p-10 w-[440px] border border-white/40 relative z-10"
      >
        {/* Header with Icon */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center mb-8"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="bg-white/30 p-4 rounded-2xl mb-4 backdrop-blur-sm"
          >
            <BookOpen size={40} className="text-white drop-shadow-lg" />
          </motion.div>
          <h2 className="text-4xl font-bold text-center text-white drop-shadow-2xl">
            Practicum Tracker
          </h2>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-transparent via-white to-transparent mt-3 rounded-full"
          />
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <motion.div variants={itemVariants} className="relative group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="absolute left-4 top-3 text-blue-700 z-10"
            >
              <Mail size={20} />
            </motion.div>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              placeholder="Email Address"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-white focus:bg-white transition-all outline-none shadow-lg backdrop-blur-sm font-medium"
            />
          </motion.div>

          {/* Password Input */}
          <motion.div variants={itemVariants} className="relative group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="absolute left-4 top-3 text-blue-700 z-10"
            >
              <Lock size={20} />
            </motion.div>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-white focus:bg-white transition-all outline-none shadow-lg backdrop-blur-sm font-medium"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            variants={itemVariants}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={20} />
                </motion.div>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-8"
        >
          <p className="text-sm text-white/90 font-medium drop-shadow">
            Practicum Support | EIT © 2025
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
