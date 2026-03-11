import mongoose from "mongoose";

const mentorFeedbackSchema = new mongoose.Schema(
  {
    logPaperId: { type: mongoose.Schema.Types.ObjectId, ref: "LogPaper", required: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MentorFeedback = mongoose.model("MentorFeedback", mentorFeedbackSchema);
export default MentorFeedback;
