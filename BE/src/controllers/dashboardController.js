import { PrismaClient } from "@prisma/client";
import LogPaper from "../models/logPaperModel.js";
import MentorFeedback from "../models/mentorFeedbackModel.js";
import TutorFeedback from "../models/tutorFeedbackModel.js";

const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*  1️⃣ Attendance Overview – Prisma (MySQL)                                   */
/* -------------------------------------------------------------------------- */
export const getAttendanceOverview = async (req, res) => {
  try {
    if (req.user.role !== "Tutor")
      return res.status(403).json({ error: "Access denied" });

    const { from, to, type } = req.query;
    const where = {};

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    if (type && type !== "All") where.type = type;

    const attendance = await prisma.attendance.findMany({
      where,
      include: { student: { select: { id: true, name: true } } },
    });

    const grouped = {};
    attendance.forEach((a) => {
      const s = a.student?.name || "Unknown";
      if (!grouped[s])
        grouped[s] = { attended: 0, missed: 0, total: 0, type: a.type };
      if (a.attended === "Yes") grouped[s].attended++;
      else grouped[s].missed++;
      grouped[s].total++;
    });

    const chartData = Object.entries(grouped).map(([name, val]) => ({
      name,
      type: val.type,
      attended: val.attended,
      missed: val.missed,
      total: val.total,
      attendanceRate:
        val.total > 0 ? ((val.attended / val.total) * 100).toFixed(1) : 0,
    }));

    res.json(chartData);
  } catch (err) {
    console.error("getAttendanceOverview error:", err);
    res.status(500).json({ error: "Failed to fetch attendance overview" });
  }
};

/* -------------------------------------------------------------------------- */
/*  2️⃣ Practicum Log Summary – MongoDB (LogPaper)                            */
/* -------------------------------------------------------------------------- */
export const getLogSummary = async (req, res) => {
  try {
    if (req.user.role !== "Tutor")
      return res.status(403).json({ error: "Access denied" });

    const { from, to, status, activity } = req.query;
    const filter = {};

    if (status && status !== "All") filter.status = status;
    if (activity && activity !== "All") filter.activity = activity;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const logs = await LogPaper.find(filter);

    const totalLogs = logs.length;
    const byStatus = logs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {});
    const byActivity = logs.reduce((acc, log) => {
      acc[log.activity] = (acc[log.activity] || 0) + 1;
      return acc;
    }, {});
    const byMonth = logs.reduce((acc, log) => {
      const month = new Date(log.createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalLogs,
      byStatus,
      byActivity: Object.entries(byActivity).map(([name, count]) => ({
        name,
        count,
      })),
      byMonth: Object.entries(byMonth).map(([name, count]) => ({
        name,
        count,
      })),
    });
  } catch (err) {
    console.error("getLogSummary error:", err);
    res.status(500).json({ error: "Failed to fetch log summary" });
  }
};

/* -------------------------------------------------------------------------- */
/*  3️⃣ Student Progress Tracker – Prisma + Mongo combo                       */
/* -------------------------------------------------------------------------- */
export const getStudentProgress = async (req, res) => {
  try {
    if (req.user.role !== "Tutor")
      return res.status(403).json({ error: "Access denied" });

    const { from, to, minHours, minLogs } = req.query;

    const attendance = await prisma.attendance.findMany({
      include: { student: { select: { id: true, name: true } } },
    });

    const logFilter = {};
    if (from || to) {
      logFilter.createdAt = {};
      if (from) logFilter.createdAt.$gte = new Date(from);
      if (to) logFilter.createdAt.$lte = new Date(to);
    }

    const logs = await LogPaper.find(logFilter);

    const progress = {};

    attendance.forEach((a) => {
      const name = a.student?.name || "Unknown";
      if (!progress[name])
        progress[name] = { attendanceDays: 0, logsSubmitted: 0, totalHours: 0 };
      if (a.attended === "Yes") progress[name].attendanceDays++;
    });

    logs.forEach((l) => {
      const studentId = l.studentId;
      const matched = attendance.find((a) => a.studentId === studentId);
      const name = matched?.student?.name || `Student #${studentId}`;

      if (!progress[name])
        progress[name] = { attendanceDays: 0, logsSubmitted: 0, totalHours: 0 };

      progress[name].logsSubmitted++;
      progress[name].totalHours += Number(l.totalHours || 0);
    });

    let data = Object.entries(progress).map(([name, val]) => ({
      name,
      ...val,
    }));

    if (minHours) data = data.filter((d) => d.totalHours >= Number(minHours));
    if (minLogs) data = data.filter((d) => d.logsSubmitted >= Number(minLogs));

    data.sort((a, b) => b.totalHours - a.totalHours);

    const totalStudents = data.length;
    const totalHours = data.reduce((s, d) => s + d.totalHours, 0);
    const avgHours = totalStudents ? (totalHours / totalStudents).toFixed(1) : 0;
    const totalLogs = data.reduce((s, d) => s + d.logsSubmitted, 0);

    res.json({
      summary: { totalStudents, totalLogs, totalHours, avgHours },
      data,
    });
  } catch (err) {
    console.error("getStudentProgress error:", err);
    res.status(500).json({ error: "Failed to fetch student progress" });
  }
};
