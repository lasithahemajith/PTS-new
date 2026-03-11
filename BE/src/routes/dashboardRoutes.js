import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getAttendanceOverview,
  getLogSummary,
  getStudentProgress,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/attendance", verifyToken, getAttendanceOverview);
router.get("/logs", verifyToken, getLogSummary);
router.get("/progress", verifyToken, getStudentProgress);

export default router;
