import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

// Utility: generate secure random password
const generateRandomPassword = (length = 10) => {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
};

// ✅ Get profile (unchanged)
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// ✅ Create user (Tutor only)
export const createUser = async (req, res) => {
  try {
    const { name, email, role, phone, studentIndex, company } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: "Name, email, and role required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Auto-generate password and hash it
    const autoPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(autoPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        phone: phone || null,
        studentIndex: role === "Student" ? studentIndex || null : null,
        company: role === "Mentor" ? company || null : null,
      },
    });

    // Return generated password (visible once to Tutor)
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

// ✅ Get users by role (includes new fields)
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        phone: true,
        studentIndex: true,
        company: true,
      },
    });
    res.json(users);
  } catch (err) {
    console.error("getUsersByRole error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ✅ Mapping features (unchanged)
export const mapMentorToStudent = async (req, res) => {
  try {
    const { mentorId, studentId } = req.body;
    if (!mentorId || !studentId)
      return res.status(400).json({ error: "mentorId and studentId required" });

    const mentor = await prisma.user.findUnique({ where: { id: Number(mentorId) } });
    const student = await prisma.user.findUnique({ where: { id: Number(studentId) } });

    if (!mentor || mentor.role !== "Mentor")
      return res.status(400).json({ error: "Invalid mentorId" });
    if (!student || student.role !== "Student")
      return res.status(400).json({ error: "Invalid studentId" });

    const mapping = await prisma.mentorStudentMap.upsert({
      where: { mentorId_studentId: { mentorId: +mentorId, studentId: +studentId } },
      update: {},
      create: { mentorId: +mentorId, studentId: +studentId },
    });

    res.status(201).json({ message: "Mapped successfully", mapping });
  } catch (err) {
    console.error("mapMentorToStudent error:", err);
    res.status(500).json({ error: "Failed to map mentor and student" });
  }
};

export const getMappings = async (req, res) => {
  try {
    const mappings = await prisma.mentorStudentMap.findMany({
      include: {
        mentor: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(mappings);
  } catch (err) {
    console.error("getMappings error:", err);
    res.status(500).json({ error: "Failed to fetch mappings" });
  }
};

export const unmapMentorFromStudent = async (req, res) => {
  try {
    const { mentorId, studentId } = req.body;
    if (!mentorId || !studentId)
      return res.status(400).json({ error: "mentorId and studentId required" });

    await prisma.mentorStudentMap.delete({
      where: { mentorId_studentId: { mentorId: +mentorId, studentId: +studentId } },
    });

    res.json({ message: "Unmapped successfully" });
  } catch (err) {
    console.error("unmapMentorFromStudent error:", err);
    res.status(500).json({ error: "Failed to unmap" });
  }
};

export const getAssignedStudents = async (req, res) => {
  try {
    if (req.user.role !== "Mentor")
      return res.status(403).json({ error: "Access denied" });

    const mappings = await prisma.mentorStudentMap.findMany({
      where: { mentorId: req.user.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            studentIndex: true,
          },
        },
      },
    });
    res.json(mappings.map((m) => m.student));
  } catch (err) {
    console.error("getAssignedStudents error:", err);
    res.status(500).json({ error: "Failed to fetch assigned students" });
  }
};
