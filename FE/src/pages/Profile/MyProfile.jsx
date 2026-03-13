import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Briefcase, Hash, Calendar, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getInitials, roleAvatarBg } from "@/utils/roleColors";
import API from "@/api/axios";

export default function MyProfile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const avatarBg = roleAvatarBg[authUser?.role] || "bg-indigo-500";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/users/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        // Fall back to auth context user data
        setProfile(authUser);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-3">
        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-400"></span>
        Loading profile…
      </div>
    );
  }

  const user = profile || authUser;

  const roleColor =
    user?.role === "Tutor"
      ? "bg-purple-100 text-purple-700"
      : user?.role === "Mentor"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-blue-100 text-blue-700";

  const fields = [
    { label: "Email", value: user?.email, icon: <Mail size={16} /> },
    { label: "Role", value: user?.role, icon: <Shield size={16} /> },
    user?.phone && { label: "Phone", value: user.phone, icon: <Phone size={16} /> },
    user?.studentIndex && {
      label: "Student Index",
      value: user.studentIndex,
      icon: <Hash size={16} />,
    },
    user?.company && {
      label: "Company",
      value: user.company,
      icon: <Briefcase size={16} />,
    },
    user?.createdAt && {
      label: "Member Since",
      value: new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      icon: <Calendar size={16} />,
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg mx-auto"
      >
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6 flex flex-col items-center text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-4 ${avatarBg}`}
          >
            {getInitials(user?.name)}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{user?.name}</h2>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${roleColor}`}>
            {user?.role}
          </span>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <User size={15} />
            Profile Details
          </h3>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.label} className="flex items-start gap-3">
                <div className="mt-0.5 text-indigo-400 flex-shrink-0">{field.icon}</div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{field.label}</p>
                  <p className="text-sm font-medium text-gray-800">{field.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
