import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ✅ Add Attendance (Prevent duplicate for same day)
export const addAttendance = async (req, res) => {
  try {
    const { type, attended, reason } = req.body;
    const studentId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // 🔍 Check for existing attendance for today
    const existing = await prisma.attendance.findFirst({
      where: {
        studentId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "You have already submitted attendance for today." });
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        type,
        attended,
        reason: attended === "No" ? reason : null,
      },
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

// ✅ Get student's attendance history
export const getMyAttendance = async (req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      where: { studentId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(records);
  } catch (err) {
    console.error("❌ getMyAttendance error:", err);
    res.status(500).json({ error: "Failed to fetch attendance history" });
  }
};

// ✅ MENTOR: Get Assigned Students' Practicum Attendance
export const getMentorAttendance = async (req, res) => {
  try {
    // Only mentors can access this
    if (req.user.role !== "Mentor") {
      return res.status(403).json({ error: "Access denied. Mentors only." });
    }

    const mentorId = req.user.id;

    // 🔹 Get list of assigned students
    const assigned = await prisma.mentorStudentMap.findMany({
      where: { mentorId },
      select: { studentId: true },
    });
    const studentIds = assigned.map((s) => s.studentId);

    if (studentIds.length === 0)
      return res.json({ message: "No students assigned." });

    // 🔹 Get attendance (only for Practicum)
    const records = await prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        type: "Practicum",
      },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(records);
  } catch (err) {
    console.error("❌ getMentorAttendance error:", err);
    res.status(500).json({ error: "Failed to fetch mentor attendance" });
  }
};

// ✅ TUTOR: View All Attendance Records (Class + Practicum)
export const getTutorAttendanceOverview = async (req, res) => {
  try {
    if (req.user.role !== "Tutor") {
      return res.status(403).json({ error: "Access denied. Tutors only." });
    }

    const records = await prisma.attendance.findMany({
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(records);
  } catch (err) {
    console.error("❌ getTutorAttendanceOverview error:", err);
    res.status(500).json({ error: "Failed to fetch attendance overview" });
  }
};
