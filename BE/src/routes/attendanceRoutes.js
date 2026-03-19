import express from "express";
import rateLimit from "express-rate-limit";
import { addAttendance, getMyAttendance, getMentorAttendance, getTutorAttendanceOverview, addAttendanceByTutor, editAttendance, deleteAttendance } from "../controllers/attendanceController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /attendance → submit attendance
router.post("/", verifyToken, addAttendance);

// GET /attendance/my → view logged student's records
router.get("/my", verifyToken, getMyAttendance);

router.get("/mentor", verifyToken, getMentorAttendance);

router.get("/tutor", verifyToken, getTutorAttendanceOverview);

// TUTOR: Add attendance for a student (for missing records)
router.post("/tutor/add", generalLimiter, verifyToken, requireRole("Tutor"), addAttendanceByTutor);

// TUTOR: Edit and Delete attendance
router.put("/:id", generalLimiter, verifyToken, requireRole("Tutor"), editAttendance);
router.delete("/:id", generalLimiter, verifyToken, requireRole("Tutor"), deleteAttendance);

export default router;
