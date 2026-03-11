import mongoose from "mongoose";

const tutorFeedbackSchema = new mongoose.Schema(
  {
    logPaperId: { type: mongoose.Schema.Types.ObjectId, ref: "LogPaper", required: true },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    feedback: { type: String, required: true },
  },
  { timestamps: true }
);

const TutorFeedback = mongoose.model("TutorFeedback", tutorFeedbackSchema);
export default TutorFeedback;
