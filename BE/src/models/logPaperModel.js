import mongoose from "mongoose";

const logPaperSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    totalHours: { type: Number },
    activity: { type: String, required: true },
    description: { type: String, required: true },
    attachments: [
      {
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
        url: String,
      },
    ],
    mentorComment: { type: String },
    tutorFeedback: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Reviewed"],
      default: "Pending",
    },
    verifiedAt: { type: Date },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

const LogPaper = mongoose.model("LogPaper", logPaperSchema);
export default LogPaper;
