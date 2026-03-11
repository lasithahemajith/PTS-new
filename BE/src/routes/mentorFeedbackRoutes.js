import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  addMentorFeedback,
  getFeedbackByLogId,
} from "../controllers/mentorFeedbackController.js";

const router = express.Router();

router.post("/", verifyToken, addMentorFeedback);
router.get("/:logPaperId", verifyToken, getFeedbackByLogId);

export default router;
