import mongoose from "mongoose";

const tutorFeedbackSchema = new mongoose.Schema(
  {
    logPaperId: { type: mongoose.Schema.Types.ObjectId, ref: "LogPaper", required: true },
    tutorId: { type: Number, required: true }, // MySQL tutor user ID
    studentId: { type: Number, required: true }, // MySQL student user ID
    feedback: { type: String, required: true },
  },
  { timestamps: true }
);

const TutorFeedback = mongoose.model("TutorFeedback", tutorFeedbackSchema);
export default TutorFeedback;
