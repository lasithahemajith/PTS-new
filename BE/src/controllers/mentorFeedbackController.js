import MentorFeedback from "../models/mentorFeedbackModel.js";
import LogPaper from "../models/logPaperModel.js";

// ✅ Save feedback for a specific log
export const addMentorFeedback = async (req, res) => {
  try {
    const { logPaperId, comment, approved } = req.body;
    const mentorId = req.user.id;

    const log = await LogPaper.findById(logPaperId);
    if (!log) return res.status(404).json({ error: "Log not found" });

    const feedback = await MentorFeedback.create({
      logPaperId,
      mentorId,
      studentId: log.studentId,
      comment,
      approved,
    });

    res.status(201).json({
      message: "✅ Feedback saved successfully",
      feedback,
    });
  } catch (err) {
    console.error("❌ addMentorFeedback error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get feedback for a log
export const getFeedbackByLogId = async (req, res) => {
  try {
    const { logPaperId } = req.params;
    const feedback = await MentorFeedback.findOne({ logPaperId });
    if (!feedback) return res.status(404).json({ message: "No feedback yet" });
    res.json(feedback);
  } catch (err) {
    console.error("❌ getFeedbackByLogId error:", err);
    res.status(500).json({ error: err.message });
  }
};
