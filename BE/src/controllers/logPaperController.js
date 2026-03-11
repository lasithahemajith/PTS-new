import LogPaper from "../models/logPaperModel.js";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* =========================================================
   STUDENT SIDE
   ========================================================= */

// ✅ CREATE Log Paper
export const createLogPaper = async (req, res) => {
  try {
    console.log("📩 Incoming form data:", req.body);
    console.log("📎 Uploaded files:", req.files);

    const { date, startTime, endTime, totalHours, activity, description } = req.body;

    if (!date || !activity || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const attachments = req.files
      ? req.files.map((file) => ({
          filename: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          url: `${req.protocol}://${req.get("host")}/${file.path.replace(/\\/g, "/")}`,
        }))
      : [];

    const log = await LogPaper.create({
      studentId: req.user.id,
      date,
      startTime,
      endTime,
      totalHours,
      activity,
      description,
      attachments,
      status: "Pending",
    });

    res.status(201).json({
      message: "✅ Log paper created successfully",
      log,
    });
  } catch (err) {
    console.error("❌ LogPaper create error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ GET Logs for Current User (role-based)
export const getMyLogPapers = async (req, res) => {
  try {
    const role = req.user.role;

    // 🧑‍🎓 Student → only their own logs
    if (role === "Student") {
      const logs = await LogPaper.find({ studentId: req.user.id }).sort({ date: -1 });
      return res.json(logs);
    }

    // 👨‍🏫 Tutor/Admin → all logs
    if (role === "Tutor" || role === "Admin") {
      const logs = await LogPaper.find().sort({ date: -1 });
      return res.json(logs);
    }

    // 👨‍💼 Mentor → only assigned students
    if (role === "Mentor") {
      const mentorId = req.user.id;
      const mappings = await prisma.mentorStudentMap.findMany({
        where: { mentorId },
        select: { studentId: true },
      });
      const studentIds = mappings.map((m) => m.studentId);
      if (studentIds.length === 0) return res.json([]);

      const logs = await LogPaper.find({ studentId: { $in: studentIds } }).sort({ date: -1 });
      return res.json(logs);
    }

    return res.status(403).json({ error: "Unauthorized access" });
  } catch (err) {
    console.error("❌ getMyLogPapers error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   MENTOR SIDE
   ========================================================= */

// ✅ MENTOR Verifies Log
export const verifyLogPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorComment } = req.body;

    const updated = await LogPaper.findByIdAndUpdate(
      id,
      {
        mentorId: req.user.id,
        mentorComment,
        status: "Verified",
        verifiedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Log not found" });

    res.json({ message: "✅ Log verified successfully", updated });
  } catch (err) {
    console.error("❌ verifyLogPaper error:", err);
    res.status(400).json({ error: err.message });
  }
};

/* =========================================================
   TUTOR SIDE
   ========================================================= */

// ✅ TUTOR Adds Feedback
export const addTutorFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { tutorFeedback } = req.body;

    const updated = await LogPaper.findByIdAndUpdate(
      id,
      {
        tutorFeedback,
        tutorId: req.user.id,
        status: "Reviewed",
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Log not found" });

    res.json({ message: "✅ Tutor feedback added successfully", updated });
  } catch (err) {
    console.error("❌ addTutorFeedback error:", err);
    res.status(400).json({ error: err.message });
  }
};

/* =========================================================
   GENERAL ACCESS
   ========================================================= */

// ✅ GET ALL Logs (Tutor/Admin)
export const getAllLogs = async (req, res) => {
  try {
    if (req.user.role !== "Tutor" && req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const logs = await LogPaper.find().sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error("❌ getAllLogs error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   MENTOR REPORTS
   ========================================================= */

export const getMentorLogs = async (req, res) => {
  try {
    if (req.user.role !== "Mentor") {
      return res.status(403).json({ error: "Access denied. Mentors only." });
    }

    const mentorId = req.user.id;

    const mappings = await prisma.mentorStudentMap.findMany({
      where: { mentorId },
      select: { studentId: true },
    });

    const studentIds = mappings.map((m) => m.studentId);
    if (studentIds.length === 0) return res.json([]);

    const logs = await LogPaper.find({ studentId: { $in: studentIds } })
      .sort({ date: -1 })
      .lean();

    res.json(logs);
  } catch (err) {
    console.error("❌ getMentorLogs error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Single Log by ID
export const getLogPaperById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await LogPaper.findById(id);
    if (!log) return res.status(404).json({ error: "Log not found" });
    res.json(log);
  } catch (err) {
    console.error("❌ getLogPaperById error:", err);
    res.status(500).json({ error: err.message });
  }
};
