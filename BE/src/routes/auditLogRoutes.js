import express from "express";
import rateLimit from "express-rate-limit";
import { getAuditLogs } from "../controllers/auditLogController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

const auditLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  message: { error: "Too many requests. Please try again later." },
});

// Tutor-only access to audit trail
router.get("/", auditLimiter, verifyToken, requireRole("Tutor"), getAuditLogs);

export default router;
