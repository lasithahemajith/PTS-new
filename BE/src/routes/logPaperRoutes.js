import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createLogPaper,
  getMyLogPapers,
  verifyLogPaper,
  addTutorFeedback,
  getAllLogs,
  getMentorLogs,
  getLogPaperById,
  updateLogPaper,
  deleteLogPaper,
} from "../controllers/logPaperController.js";

dotenv.config();
const router = express.Router();

const logMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadDir = path.resolve(process.env.UPLOAD_PATH || "uploads/logpapers");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

const logReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Routes
router.post("/", verifyToken, upload.array("attachments"), createLogPaper);
router.get("/my", verifyToken, getMyLogPapers);
router.patch("/:id/verify", verifyToken, verifyLogPaper);
router.patch("/:id/feedback", verifyToken, addTutorFeedback);
router.get("/all", verifyToken, getAllLogs);
router.get("/mentor/reports", verifyToken, getMentorLogs);
router.get("/:id", logReadLimiter, verifyToken, getLogPaperById);
router.put("/:id", logMutationLimiter, verifyToken, updateLogPaper);
router.delete("/:id", logMutationLimiter, verifyToken, deleteLogPaper);

export default router;
