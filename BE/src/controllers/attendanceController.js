import Attendance from "../models/attendanceModel.js";
import MentorStudentMap from "../models/mentorStudentMapModel.js";
import User from "../models/userModel.js";
import { createAuditLog } from "../utils/auditLogger.js";

// Add Attendance (Prevent duplicate of same type for same day)
export const addAttendance = async (req, res) => {
  try {
    const { type, attended, reason, latitude, longitude, locationName } = req.body;
    const studentId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Attendance.findOne({
      studentId,
      type,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: `You have already submitted ${type} attendance for today.` });
    }

    const attendance = await Attendance.create({
      studentId,
      type,
      attended,
      reason: attended === "No" ? reason : null,
      latitude: attended === "Yes" && latitude != null ? parseFloat(latitude) : null,
      longitude: attended === "Yes" && longitude != null ? parseFloat(longitude) : null,
      locationName: attended === "Yes" ? (locationName || null) : null,
    });

    res.status(201).json({
      message: "✅ Attendance recorded successfully!",
      attendance,
    });

    createAuditLog({
      userId: req.user.id,
      userName: req.user.name || req.user.id,
      userRole: req.user.role,
      action: "SUBMIT_ATTENDANCE",
      resource: "attendance",
      resourceId: attendance._id?.toString(),
      details: `Type: ${type}, Attended: ${attended}`,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || null,
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
      .populate("studentId", "id name email studentIndex")
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    console.error("❌ getTutorAttendanceOverview error:", err);
    res.status(500).json({ error: "Failed to fetch attendance overview" });
  }
};

// TUTOR: Add Attendance for a Student (can add for any date)
export const addAttendanceByTutor = async (req, res) => {
  try {
    if (req.user.role !== "Tutor") {
      return res.status(403).json({ error: "Access denied. Tutors only." });
    }

    const { studentId, type, attended, reason, date } = req.body;
    if (!studentId || !type || !attended) {
      return res.status(400).json({ error: "studentId, type, and attended are required" });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "Student") {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    const recordDate = date ? new Date(date) : new Date();

    // Validate date is not in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (recordDate > today) {
      return res.status(400).json({ error: "Attendance date cannot be in the future." });
    }

    const startOfDay = new Date(recordDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(recordDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Attendance.findOne({
      studentId,
      type,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing) {
      return res.status(400).json({ error: `Attendance for this student (${type}) on that date already exists.` });
    }

    const attendance = await Attendance.create({
      studentId,
      type,
      attended,
      reason: attended === "No" ? reason : null,
      createdAt: recordDate,
    });

    res.status(201).json({ message: "✅ Attendance added successfully", attendance });

    createAuditLog({
      userId: req.user.id,
      userName: req.user.name || req.user.id,
      userRole: req.user.role,
      action: "ADD_ATTENDANCE_TUTOR",
      resource: "attendance",
      resourceId: attendance._id?.toString(),
      details: `Tutor added attendance for student ${student.name}: Type=${type}, Attended=${attended}`,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || null,
    });
  } catch (err) {
    console.error("❌ addAttendanceByTutor error:", err);
    res.status(500).json({ error: "Failed to add attendance" });
  }
};

// TUTOR: Edit Attendance Record
export const editAttendance = async (req, res) => {
  try {
    if (req.user.role !== "Tutor") {
      return res.status(403).json({ error: "Access denied. Tutors only." });
    }

    const { id } = req.params;
    const { type, attended, reason } = req.body;

    const record = await Attendance.findById(id);
    if (!record) return res.status(404).json({ error: "Attendance record not found" });

    if (type) record.type = type;
    if (attended) record.attended = attended;
    record.reason = attended === "No" ? (reason || null) : null;

    await record.save();

    res.json({ message: "✅ Attendance updated successfully", attendance: record });

    createAuditLog({
      userId: req.user.id,
      userName: req.user.name || req.user.id,
      userRole: req.user.role,
      action: "EDIT_ATTENDANCE",
      resource: "attendance",
      resourceId: id,
      details: `Edited attendance: Type=${record.type}, Attended=${record.attended}`,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || null,
    });
  } catch (err) {
    console.error("❌ editAttendance error:", err);
    res.status(500).json({ error: "Failed to update attendance" });
  }
};

// TUTOR: Delete Attendance Record
export const deleteAttendance = async (req, res) => {
  try {
    if (req.user.role !== "Tutor") {
      return res.status(403).json({ error: "Access denied. Tutors only." });
    }

    const { id } = req.params;
    const record = await Attendance.findById(id);
    if (!record) return res.status(404).json({ error: "Attendance record not found" });

    await Attendance.findByIdAndDelete(id);

    res.json({ message: "✅ Attendance deleted successfully" });

    createAuditLog({
      userId: req.user.id,
      userName: req.user.name || req.user.id,
      userRole: req.user.role,
      action: "DELETE_ATTENDANCE",
      resource: "attendance",
      resourceId: id,
      details: `Deleted attendance record`,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || null,
    });
  } catch (err) {
    console.error("❌ deleteAttendance error:", err);
    res.status(500).json({ error: "Failed to delete attendance" });
  }
};
