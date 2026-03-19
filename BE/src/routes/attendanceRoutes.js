import express from "express";
import { addAttendance, getMyAttendance, getMentorAttendance, getTutorAttendanceOverview } from "../controllers/attendanceController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /attendance → submit attendance
router.post("/", verifyToken, addAttendance);

// GET /attendance/my → view logged student's records
router.get("/my", verifyToken, getMyAttendance);

router.get("/mentor", verifyToken, getMentorAttendance);

router.get("/tutor", verifyToken, getTutorAttendanceOverview);

export default router;
