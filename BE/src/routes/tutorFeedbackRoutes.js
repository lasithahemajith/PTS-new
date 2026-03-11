import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  addTutorFeedback,
  getTutorFeedbacks,
  getAllTutorFeedbacks,
  markAsReviewed,
} from "../controllers/tutorFeedbackController.js";

const router = express.Router();

// ✅ Mark as reviewed (for button click only)
router.patch("/reviewed/:id", verifyToken, markAsReviewed);

// ✅ Add feedback (does NOT mark reviewed)
router.patch("/:id", verifyToken, addTutorFeedback);

// ✅ Get feedbacks for a specific log
router.get("/:id", verifyToken, getTutorFeedbacks);

// ✅ Get all tutor feedbacks (admin/tutor view)
router.get("/", verifyToken, getAllTutorFeedbacks);

export default router;
