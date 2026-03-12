import express from "express";
import rateLimit from "express-rate-limit";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getProfile } from "../controllers/userController.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import {
    createUser,
    getUsersByRole,
    mapMentorToStudent,
    getMappings,
    unmapMentorFromStudent,
    getAssignedStudents,
    resetUserPassword,
    changeOwnPassword,
  } from "../controllers/userController.js";
  
const router = express.Router();

// Rate limiter for password-related endpoints
const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// All require auth
router.use(verifyToken);

router.get("/profile", verifyToken, getProfile);

// ✅ Change own password (first login or self-service)
router.post("/change-password", passwordLimiter, changeOwnPassword);

// ✅ NEW endpoint for mentors
router.get("/assigned-students", verifyToken, getAssignedStudents);

// Tutor (admin) only
router.post("/", requireRole("Tutor"), createUser);
router.post("/map", requireRole("Tutor"), mapMentorToStudent);
router.delete("/map", requireRole("Tutor"), unmapMentorFromStudent);
router.post("/:userId/reset-password", passwordLimiter, requireRole("Tutor"), resetUserPassword);

// Anyone authenticated can list users (or restrict to Tutor if you prefer)
router.get("/", getUsersByRole);

// List mappings (restrict to Tutor if you prefer)
router.get("/mappings", getMappings);

export default router;
