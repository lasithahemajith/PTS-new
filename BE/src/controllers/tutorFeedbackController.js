import TutorFeedback from "../models/tutorFeedbackModel.js";
import LogPaper from "../models/logPaperModel.js";

// ✅ Add tutor feedback (saved separately; does NOT change status)
export const addTutorFeedback = async (req, res) => {
  try {
    const { id } = req.params; // LogPaper ID
    const { feedback } = req.body;

    // Create tutor feedback entry (multiple feedbacks allowed)
    const savedFeedback = await TutorFeedback.create({
      logPaperId: id,
      tutorId: req.user.id,
      studentId: req.user.id, // You can later change to real studentId if needed
      feedback,
    });

    // ❌ Do NOT change LogPaper status here (per your request)
    // Just keep last feedback content updated
    await LogPaper.findByIdAndUpdate(id, {
      tutorFeedback: feedback,
      tutorId: req.user.id,
    });

    res.status(201).json({
      message: "✅ Tutor feedback saved successfully",
      savedFeedback,
    });
  } catch (err) {
    console.error("❌ addTutorFeedback error:", err);
    res.status(500).json({ error: "Failed to add tutor feedback" });
  }
};

// ✅ Get all tutor feedback for a single log
export const getTutorFeedbacks = async (req, res) => {
  try {
    const { id } = req.params;
    const feedbacks = await TutorFeedback.find({ logPaperId: id }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error("❌ getTutorFeedbacks error:", err);
    res.status(500).json({ error: "Failed to fetch tutor feedbacks" });
  }
};

// ✅ Get all tutor feedbacks (admin/tutor summary view)
export const getAllTutorFeedbacks = async (req, res) => {
  try {
    const feedbacks = await TutorFeedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error("❌ getAllTutorFeedbacks error:", err);
    res.status(500).json({ error: "Failed to fetch all tutor feedbacks" });
  }
};

// ✅ Mark a LogPaper as Reviewed (only for button click)
export const markAsReviewed = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "LogPaper ID is required" });
    }

    // Update the LogPaper status only when button clicked
    const updated = await LogPaper.findByIdAndUpdate(
      id,
      {
        status: "Reviewed",
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "LogPaper not found" });
    }

    res.json({
      message: "🎉 Log marked as Reviewed successfully",
      log: updated,
    });
  } catch (err) {
    console.error("❌ markAsReviewed error:", err);
    res.status(500).json({ error: "Failed to mark log as reviewed" });
  }
};
