import {
  getTutorDashboardStats,
  getTutorInsights,
} from "../services/tutorDashboardService.js";

/**
 * ✅ GET /tutor/dashboard-stats
 */
export const dashboardStats = async (req, res) => {
  try {
    if (req.user.role !== "Tutor") {
      return res.status(403).json({ error: "Access denied. Tutors only." });
    }

    const stats = await getTutorDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error("❌ dashboardStats error:", err);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
};

/**
 * ✅ GET /tutor/dashboard-insights
 */
export const dashboardInsights = async (req, res) => {
  try {
    if (req.user.role !== "Tutor") {
      return res.status(403).json({ error: "Access denied. Tutors only." });
    }

    const insights = await getTutorInsights();
    res.json(insights);
  } catch (err) {
    console.error("❌ dashboardInsights error:", err);
    res.status(500).json({ error: "Failed to load insights" });
  }
};
