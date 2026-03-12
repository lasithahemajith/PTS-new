import Attendance from "../models/attendanceModel.js";
import MentorStudentMap from "../models/mentorStudentMapModel.js";

// Add Attendance (Prevent duplicate for same day)
export const addAttendance = async (req, res) => {
  try {
    const { type, attended, reason } = req.body;
    const studentId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Attendance.findOne({
      studentId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "You have already submitted attendance for today." });
    }

    const attendance = await Attendance.create({
      studentId,
      type,
      attended,
      reason: attended === "No" ? reason : null,
    });

    res.status(201).json({
      message: "✅ Attendance recorded successfully!",
      attendance,
    });
  } catch (err) {
    console.error("❌ addAttendance error:", err);
    res.status(500).json({ error: "Failed to record attendance" });
  }
};

// Get student's attendance history
export const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error("❌ getMyAttendance error:", err);
    res.status(500).json({ error: "Failed to fetch attendance history" });
  }
};

// MENTOR: Get Assigned Students' Practicum Attendance
export const getMentorAttendance = async (req, res) => {
  try {
    if (req.user.role !== "Mentor") {
      return res.status(403).json({ error: "Access denied. Mentors only." });
    }

    const mentorId = req.user.id;

    const assigned = await MentorStudentMap.find({ mentorId }).select("studentId");
    const studentIds = assigned.map((s) => s.studentId);

    if (studentIds.length === 0)
      return res.json([]);

    const records = await Attendance.find({
      studentId: { $in: studentIds },
      type: "Practicum",
    })
      .populate("studentId", "id name email")
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    console.error("❌ getMentorAttendance error:", err);
    res.status(500).json({ error: "Failed to fetch mentor attendance" });
  }
};

// TUTOR: View All Attendance Records (Class + Practicum)
export const getTutorAttendanceOverview = async (req, res) => {
  try {
    if (req.user.role !== "Tutor") {
      return res.status(403).json({ error: "Access denied. Tutors only." });
    }

    const records = await Attendance.find()
      .populate("studentId", "id name email")
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    console.error("❌ getTutorAttendanceOverview error:", err);
    res.status(500).json({ error: "Failed to fetch attendance overview" });
  }
};
