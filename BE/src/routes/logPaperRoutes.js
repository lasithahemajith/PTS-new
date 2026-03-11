import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createLogPaper,
  getMyLogPapers,
  verifyLogPaper,
  addTutorFeedback,
  getAllLogs,
  getMentorLogs,
  getLogPaperById,
} from "../controllers/logPaperController.js";

dotenv.config();
const router = express.Router();

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

// ✅ Routes
router.post("/", verifyToken, upload.array("attachments"), createLogPaper);
router.get("/my", verifyToken, getMyLogPapers);
router.patch("/:id/verify", verifyToken, verifyLogPaper);
router.patch("/:id/feedback", verifyToken, addTutorFeedback);
router.get("/all", verifyToken, getAllLogs);
router.get("/mentor/reports", verifyToken, getMentorLogs);
router.get("/:id", verifyToken, getLogPaperById);

export default router;
