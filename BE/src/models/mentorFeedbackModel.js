import mongoose from "mongoose";

const mentorFeedbackSchema = new mongoose.Schema(
  {
    logPaperId: { type: mongoose.Schema.Types.ObjectId, ref: "LogPaper", required: true },
    mentorId: { type: Number, required: true }, // MySQL mentor user ID
    studentId: { type: Number, required: true }, // MySQL student user ID
    comment: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MentorFeedback = mongoose.model("MentorFeedback", mentorFeedbackSchema);
export default MentorFeedback;
