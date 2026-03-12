import express from "express";
import rateLimit from "express-rate-limit";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

const notificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(notificationLimiter);
router.use(verifyToken);

router.get("/", notificationLimiter, getNotifications);
router.patch("/:id/read", notificationLimiter, markAsRead);
router.patch("/read-all", notificationLimiter, markAllAsRead);

export default router;
