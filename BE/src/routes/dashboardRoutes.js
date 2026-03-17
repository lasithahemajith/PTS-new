import express from "express";
import rateLimit from "express-rate-limit";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getAttendanceOverview,
  getLogSummary,
  getStudentProgress,
  getMentorActivity,
} from "../controllers/dashboardController.js";

const router = express.Router();

const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  message: { error: "Too many requests. Please try again later." },
});

router.get("/attendance", dashboardLimiter, verifyToken, getAttendanceOverview);
router.get("/logs", dashboardLimiter, verifyToken, getLogSummary);
router.get("/progress", dashboardLimiter, verifyToken, getStudentProgress);
router.get("/mentor-activity", dashboardLimiter, verifyToken, getMentorActivity);

export default router;
