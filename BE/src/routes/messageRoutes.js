import express from "express";
import rateLimit from "express-rate-limit";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getAvailableRecipients,
  sendMessage,
  getInbox,
  getSent,
  markMessageAsRead,
} from "../controllers/messageController.js";

const router = express.Router();

const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(messageLimiter);
router.use(verifyToken);

router.get("/recipients", getAvailableRecipients);
router.post("/", sendMessage);
router.get("/inbox", getInbox);
router.get("/sent", getSent);
router.patch("/:id/read", markMessageAsRead);

export default router;
