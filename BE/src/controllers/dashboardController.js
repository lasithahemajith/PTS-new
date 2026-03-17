import Attendance from "../models/attendanceModel.js";
import LogPaper from "../models/logPaperModel.js";
import MentorFeedback from "../models/mentorFeedbackModel.js";
import TutorFeedback from "../models/tutorFeedbackModel.js";
import User from "../models/userModel.js";
import MentorStudentMap from "../models/mentorStudentMapModel.js";

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

    const { from, to, minHours, minLogs, student, activity, status } = req.query;

    const attendanceFilter = {};
    const logFilter = {};
    if (from || to) {
      const dateFilter = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) dateFilter.$lte = new Date(to);
      attendanceFilter.createdAt = dateFilter;
      logFilter.createdAt = dateFilter;
    }
    if (activity && activity !== "All") logFilter.activity = activity;
    if (status && status !== "All") logFilter.status = status;

    const attendance = await Attendance.find(attendanceFilter).populate("studentId", "name");
    const logs = await LogPaper.find(logFilter).populate("studentId", "name");

    const progress = {};

    const initStudent = () => ({
      attendanceDays: 0,
      logsSubmitted: 0,
      totalHours: 0,
      pendingLogs: 0,
      verifiedLogs: 0,
      reviewedLogs: 0,
      activities: {},
    });

    attendance.forEach((a) => {
      const name = a.studentId?.name || "Unknown";
      if (!progress[name]) progress[name] = initStudent();
      if (a.attended === "Yes") progress[name].attendanceDays++;
    });

    logs.forEach((l) => {
      const name = l.studentId?.name || `Student #${l.studentId?._id || l.studentId}`;
      if (!progress[name]) progress[name] = initStudent();
      progress[name].logsSubmitted++;
      progress[name].totalHours += Number(l.totalHours || 0);
      if (l.status === "Pending") progress[name].pendingLogs++;
      else if (l.status === "Verified") progress[name].verifiedLogs++;
      else if (l.status === "Reviewed") progress[name].reviewedLogs++;
      if (l.activity) {
        progress[name].activities[l.activity] =
          (progress[name].activities[l.activity] || 0) + 1;
      }
    });

    let data = Object.entries(progress).map(([name, val]) => ({
      name,
      attendanceDays: val.attendanceDays,
      logsSubmitted: val.logsSubmitted,
      totalHours: parseFloat(val.totalHours.toFixed(1)),
      pendingLogs: val.pendingLogs,
      verifiedLogs: val.verifiedLogs,
      reviewedLogs: val.reviewedLogs,
      avgHoursPerLog:
        val.logsSubmitted > 0
          ? parseFloat((val.totalHours / val.logsSubmitted).toFixed(1))
          : 0,
      activitiesBreakdown: Object.entries(val.activities).map(([actName, count]) => ({
        name: actName,
        count,
      })),
    }));

    // Filter by student name search
    if (student && student.trim()) {
      const q = student.toLowerCase();
      data = data.filter((d) => d.name.toLowerCase().includes(q));
    }
    if (minHours) data = data.filter((d) => d.totalHours >= Number(minHours));
    if (minLogs) data = data.filter((d) => d.logsSubmitted >= Number(minLogs));

    data.sort((a, b) => b.totalHours - a.totalHours);

    const totalStudents = data.length;
    const totalHours = parseFloat(data.reduce((s, d) => s + d.totalHours, 0).toFixed(1));
    const avgHours = totalStudents
      ? parseFloat((totalHours / totalStudents).toFixed(1))
      : 0;
    const totalLogs = data.reduce((s, d) => s + d.logsSubmitted, 0);
    const totalPending = data.reduce((s, d) => s + d.pendingLogs, 0);
    const totalVerified = data.reduce((s, d) => s + d.verifiedLogs, 0);
    const totalReviewed = data.reduce((s, d) => s + d.reviewedLogs, 0);

    res.json({
      summary: {
        totalStudents,
        totalLogs,
        totalHours,
        avgHours,
        totalPending,
        totalVerified,
        totalReviewed,
      },
      data,
    });
  } catch (err) {
    console.error("getStudentProgress error:", err);
    res.status(500).json({ error: "Failed to fetch student progress" });
  }
};

/* -------------------------------------------------------------------------- */
/*  4. Mentor Activity Report – MongoDB                                        */
/* -------------------------------------------------------------------------- */
export const getMentorActivity = async (req, res) => {
  try {
    if (req.user.role !== "Tutor")
      return res.status(403).json({ error: "Access denied" });

    const { from, to, mentor, approved } = req.query;

    // Build date filter for mentor feedbacks
    const feedbackFilter = {};
    if (from || to) {
      feedbackFilter.createdAt = {};
      if (from) feedbackFilter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        feedbackFilter.createdAt.$lte = toDate;
      }
    }
    if (approved !== undefined && approved !== "All") {
      feedbackFilter.approved = approved === "true";
    }

    // Fetch all mentors
    const mentors = await User.find({ role: "Mentor" }, "name email phone company").lean();
    const mentorIds = mentors.map((m) => m._id);

    // Fetch all mentor feedbacks (with student and log details)
    const feedbacks = await MentorFeedback.find({ ...feedbackFilter, mentorId: { $in: mentorIds } })
      .populate("mentorId", "name email")
      .populate("studentId", "name studentIndex")
      .populate("logPaperId", "date activity totalHours status")
      .lean();

    // Fetch assigned student counts per mentor (scoped to known mentors)
    const maps = await MentorStudentMap.find({ mentorId: { $in: mentorIds } }).lean();
    const assignedCountMap = {};
    maps.forEach((m) => {
      const mid = m.mentorId.toString();
      assignedCountMap[mid] = (assignedCountMap[mid] || 0) + 1;
    });

    // Group feedbacks by mentorId
    const feedbacksByMentor = {};
    feedbacks.forEach((fb) => {
      const mid = fb.mentorId?._id?.toString() || fb.mentorId?.toString();
      if (!mid) return;
      if (!feedbacksByMentor[mid]) feedbacksByMentor[mid] = [];
      feedbacksByMentor[mid].push(fb);
    });

    // Build result per mentor
    let data = mentors.map((m) => {
      const mid = m._id.toString();
      const mFeedbacks = feedbacksByMentor[mid] || [];
      const approvedCount = mFeedbacks.filter((f) => f.approved).length;
      const pendingCount = mFeedbacks.length - approvedCount;
      const lastActivity =
        mFeedbacks.length > 0
          ? mFeedbacks.reduce((latestTs, f) => {
              const ts = new Date(f.createdAt).getTime();
              return ts > latestTs ? ts : latestTs;
            }, 0)
          : null;

      return {
        _id: mid,
        name: m.name,
        email: m.email,
        phone: m.phone || null,
        company: m.company || null,
        assignedStudents: assignedCountMap[mid] || 0,
        totalFeedbacks: mFeedbacks.length,
        approvedFeedbacks: approvedCount,
        pendingFeedbacks: pendingCount,
        lastActivityDate: lastActivity ? new Date(lastActivity) : null,
        feedbacks: mFeedbacks.map((f) => ({
          _id: f._id,
          studentName: f.studentId?.name || "—",
          studentIndex: f.studentId?.studentIndex || "—",
          logDate: f.logPaperId?.date || null,
          logActivity: f.logPaperId?.activity || "—",
          logHours: f.logPaperId?.totalHours ?? null,
          logStatus: f.logPaperId?.status || "—",
          comment: f.comment,
          approved: f.approved,
          createdAt: f.createdAt,
        })),
      };
    });

    // Filter by mentor name
    if (mentor && mentor.trim()) {
      const q = mentor.trim().toLowerCase();
      data = data.filter((m) => m.name.toLowerCase().includes(q));
    }

    // Summary stats
    const totalMentors = data.length;
    const activeMentors = data.filter((m) => m.totalFeedbacks > 0).length;
    const totalFeedbacks = data.reduce((s, m) => s + m.totalFeedbacks, 0);
    const totalApproved = data.reduce((s, m) => s + m.approvedFeedbacks, 0);
    const totalPending = data.reduce((s, m) => s + m.pendingFeedbacks, 0);

    res.json({
      summary: {
        totalMentors,
        activeMentors,
        totalFeedbacks,
        totalApproved,
        totalPending,
      },
      data,
    });
  } catch (err) {
    console.error("getMentorActivity error:", err);
    res.status(500).json({ error: "Failed to fetch mentor activity" });
  }
};
