import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import MentorStudentMap from "../models/mentorStudentMapModel.js";
import { createNotification } from "../utils/notificationHelper.js";

// Utility: generate secure random password
const generateRandomPassword = (length = 10) => {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
};

// Get profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("id name email role");
    res.json(user);
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Create user (Tutor only)
export const createUser = async (req, res) => {
  try {
    const { name, email, role, phone, studentIndex, company } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: "Name, email, and role required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const autoPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(autoPassword, 10);

    const userData = {
      name,
      email,
      role,
      password: hashedPassword,
      phone: phone || null,
      mustChangePassword: true,
    };

    if (role === "Student" && studentIndex) {
      userData.studentIndex = studentIndex;
    }

    if (role === "Mentor" && company) {
      userData.company = company;
    }

    const newUser = await User.create(userData);

    // Notify all Tutors about the new user creation
    const tutors = await User.find({ role: "Tutor" }).select("_id");
    if (tutors.length > 0) {
      await createNotification(
        tutors.map((t) => ({
          userId: t._id,
          type: "user_created",
          message: `New ${newUser.role} "${newUser.name}" has been registered.`,
          relatedId: newUser._id,
        }))
      );
    }

    res.status(201).json({
      message: "✅ User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        studentIndex: newUser.studentIndex,
        company: newUser.company,
      },
      generatedPassword: autoPassword,
      info: "Password auto-generated and securely stored (visible once to Tutor).",
    });
  } catch (err) {
    console.error("createUser error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// Get users by role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    const users = await User.find(where)
      .sort({ createdAt: -1 })
      .select("id name email role createdAt phone studentIndex company");
    res.json(users);
  } catch (err) {
    console.error("getUsersByRole error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Resolve a user by MongoDB ObjectId or by name
const resolveUser = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byId = await User.findById(identifier);
    if (byId) return byId;
  }
  return await User.findOne({ name: identifier });
};

// Map mentor to student
export const mapMentorToStudent = async (req, res) => {
  try {
    const { mentorId, studentId } = req.body;
    if (!mentorId || !studentId)
      return res.status(400).json({ error: "mentorId and studentId required" });

    const mentor = await resolveUser(mentorId);
    const student = await resolveUser(studentId);

    if (!mentor || mentor.role !== "Mentor")
      return res.status(400).json({ error: "Invalid mentorId" });
    if (!student || student.role !== "Student")
      return res.status(400).json({ error: "Invalid studentId" });

    const mapping = await MentorStudentMap.findOneAndUpdate(
      { mentorId: mentor._id, studentId: student._id },
      { mentorId: mentor._id, studentId: student._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Notify the mentor about the new student assignment
    await createNotification({
      userId: mentor._id,
      type: "student_assigned",
      message: `Student "${student.name}" has been assigned to you.`,
      relatedId: student._id,
    });

    // Notify the student about their mentor assignment
    await createNotification({
      userId: student._id,
      type: "student_assigned",
      message: `You have been assigned to mentor "${mentor.name}".`,
      relatedId: mentor._id,
    });

    res.status(201).json({ message: "Mapped successfully", mapping });
  } catch (err) {
    console.error("mapMentorToStudent error:", err);
    res.status(500).json({ error: "Failed to map mentor and student" });
  }
};

// Get all mappings
export const getMappings = async (req, res) => {
  try {
    const mappings = await MentorStudentMap.find()
      .populate("mentorId", "id name email")
      .populate("studentId", "id name email")
      .sort({ createdAt: -1 });

    const formattedMappings = mappings.map((m) => ({
      id: m.id,
      mentor: m.mentorId,
      student: m.studentId,
      createdAt: m.createdAt,
    }));

    res.json(formattedMappings);
  } catch (err) {
    console.error("getMappings error:", err);
    res.status(500).json({ error: "Failed to fetch mappings" });
  }
};

// Unmap mentor from student
export const unmapMentorFromStudent = async (req, res) => {
  try {
    const { mentorId, studentId } = req.body;
    if (!mentorId || !studentId)
      return res.status(400).json({ error: "mentorId and studentId required" });

    const mentor = await resolveUser(mentorId);
    const student = await resolveUser(studentId);

    if (!mentor) return res.status(400).json({ error: "Invalid mentorId" });
    if (!student) return res.status(400).json({ error: "Invalid studentId" });

    await MentorStudentMap.findOneAndDelete({ mentorId: mentor._id, studentId: student._id });

    res.json({ message: "Unmapped successfully" });
  } catch (err) {
    console.error("unmapMentorFromStudent error:", err);
    res.status(500).json({ error: "Failed to unmap" });
  }
};

// Get assigned students for a mentor
export const getAssignedStudents = async (req, res) => {
  try {
    if (req.user.role !== "Mentor")
      return res.status(403).json({ error: "Access denied" });

    const mappings = await MentorStudentMap.find({ mentorId: req.user.id })
      .populate("studentId", "id name email phone studentIndex");

    res.json(mappings.map((m) => m.studentId));
  } catch (err) {
    console.error("getAssignedStudents error:", err);
    res.status(500).json({ error: "Failed to fetch assigned students" });
  }
};

// Reset user password (Tutor only)
export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === "Tutor") return res.status(403).json({ error: "Cannot reset password for a Tutor account" });

    const newPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.mustChangePassword = true;
    await user.save();

    res.json({
      message: "✅ Password reset successfully",
      generatedPassword: newPassword,
      info: "New password generated. User must change it on next login.",
    });
  } catch (err) {
    console.error("resetUserPassword error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

// Change own password (any authenticated user)
export const changeOwnPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: "✅ Password changed successfully" });
  } catch (err) {
    console.error("changeOwnPassword error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
};
