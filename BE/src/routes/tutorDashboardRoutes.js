import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  dashboardStats,
  dashboardInsights,
} from "../controllers/tutorDashboardController.js";

const router = express.Router();

// Tutor dashboard APIs
router.get("/dashboard-stats", verifyToken, dashboardStats);
router.get("/dashboard-insights", verifyToken, dashboardInsights);

export default router;
