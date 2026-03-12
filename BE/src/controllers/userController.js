import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import MentorStudentMap from "../models/mentorStudentMapModel.js";

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
    const { name, email, role, phone } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: "Name, email, and role required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const autoPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(autoPassword, 10);

    const newUser = await User.create({
      name,
      email,
      role,
      password: hashedPassword,
      phone: phone || null,
    });

    res.status(201).json({
      message: "✅ User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
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

// Map mentor to student
export const mapMentorToStudent = async (req, res) => {
  try {
    const { mentorId, studentId } = req.body;
    if (!mentorId || !studentId)
      return res.status(400).json({ error: "mentorId and studentId required" });

    if (!mongoose.Types.ObjectId.isValid(mentorId))
      return res.status(400).json({ error: "Invalid mentorId" });
    if (!mongoose.Types.ObjectId.isValid(studentId))
      return res.status(400).json({ error: "Invalid studentId" });

    const mentor = await User.findById(mentorId);
    const student = await User.findById(studentId);

    if (!mentor || mentor.role !== "Mentor")
      return res.status(400).json({ error: "Invalid mentorId" });
    if (!student || student.role !== "Student")
      return res.status(400).json({ error: "Invalid studentId" });

    const mapping = await MentorStudentMap.findOneAndUpdate(
      { mentorId, studentId },
      { mentorId, studentId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

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

    if (!mongoose.Types.ObjectId.isValid(mentorId))
      return res.status(400).json({ error: "Invalid mentorId" });
    if (!mongoose.Types.ObjectId.isValid(studentId))
      return res.status(400).json({ error: "Invalid studentId" });

    await MentorStudentMap.findOneAndDelete({ mentorId, studentId });

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
