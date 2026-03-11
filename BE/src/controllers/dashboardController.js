import Attendance from "../models/attendanceModel.js";
import LogPaper from "../models/logPaperModel.js";
import MentorFeedback from "../models/mentorFeedbackModel.js";
import TutorFeedback from "../models/tutorFeedbackModel.js";

/* -------------------------------------------------------------------------- */
/*  1. Attendance Overview – MongoDB                                           */
/* -------------------------------------------------------------------------- */
export const getAttendanceOverview = async (req, res) => {
  try {
    if (req.user.role !== "Tutor")
      return res.status(403).json({ error: "Access denied" });

    const { from, to, type } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    if (type && type !== "All") filter.type = type;

    const attendance = await Attendance.find(filter).populate("studentId", "name");

    const grouped = {};
    attendance.forEach((a) => {
      const s = a.studentId?.name || "Unknown";
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
/*  2. Practicum Log Summary – MongoDB (LogPaper)                             */
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
/*  3. Student Progress Tracker – MongoDB                                     */
/* -------------------------------------------------------------------------- */
export const getStudentProgress = async (req, res) => {
  try {
    if (req.user.role !== "Tutor")
      return res.status(403).json({ error: "Access denied" });

    const { from, to, minHours, minLogs } = req.query;

    const attendanceFilter = {};
    const logFilter = {};
    if (from || to) {
      const dateFilter = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) dateFilter.$lte = new Date(to);
      attendanceFilter.createdAt = dateFilter;
      logFilter.createdAt = dateFilter;
    }

    const attendance = await Attendance.find(attendanceFilter).populate("studentId", "name");
    const logs = await LogPaper.find(logFilter).populate("studentId", "name");

    const progress = {};

    attendance.forEach((a) => {
      const name = a.studentId?.name || "Unknown";
      if (!progress[name])
        progress[name] = { attendanceDays: 0, logsSubmitted: 0, totalHours: 0 };
      if (a.attended === "Yes") progress[name].attendanceDays++;
    });

    logs.forEach((l) => {
      const name = l.studentId?.name || `Student #${l.studentId}`;
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
