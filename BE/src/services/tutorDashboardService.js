import { PrismaClient } from "@prisma/client";
import LogPaper from "../models/logPaperModel.js";
import TutorFeedback from "../models/tutorFeedbackModel.js";
import MentorFeedback from "../models/mentorFeedbackModel.js";

const prisma = new PrismaClient();

/**
 * 🔹 Collect dashboard stats for Tutor
 */
export const getTutorDashboardStats = async () => {
  // Count users from MySQL
  const [totalStudents, totalMentors] = await Promise.all([
    prisma.user.count({ where: { role: "Student" } }),
    prisma.user.count({ where: { role: "Mentor" } }),
  ]);

  // Count logs & feedbacks from MongoDB
  const [totalLogs, pendingLogs, verifiedLogs, reviewedLogs, tutorFeedbacks, mentorFeedbacks] =
    await Promise.all([
      LogPaper.countDocuments(),
      LogPaper.countDocuments({ status: "Pending" }),
      LogPaper.countDocuments({ status: "Verified" }),
      LogPaper.countDocuments({ status: "Reviewed" }),
      TutorFeedback.countDocuments(),
      MentorFeedback.countDocuments(),
    ]);

  return {
    totalStudents,
    totalMentors,
    totalLogs,
    pendingLogs,
    verifiedLogs,
    reviewedLogs,
    tutorFeedbacks,
    mentorFeedbacks,
  };
};

/**
 * 🔹 Simple insights (optional extras for dashboard)
 */
export const getTutorInsights = async () => {
  // Most active students (by number of log papers)
  const activeStudents = await LogPaper.aggregate([
    { $group: { _id: "$studentId", totalLogs: { $sum: 1 } } },
    { $sort: { totalLogs: -1 } },
    { $limit: 5 },
  ]);

  // Mentors with most pending logs
  const pendingMentors = await LogPaper.aggregate([
    { $match: { status: "Pending" } },
    { $group: { _id: "$mentorId", pendingCount: { $sum: 1 } } },
    { $sort: { pendingCount: -1 } },
    { $limit: 5 },
  ]);

  return { activeStudents, pendingMentors };
};
