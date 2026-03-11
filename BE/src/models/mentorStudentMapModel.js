import mongoose from "mongoose";

const mentorStudentMapSchema = new mongoose.Schema(
  {
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

mentorStudentMapSchema.index({ mentorId: 1, studentId: 1 }, { unique: true });

const MentorStudentMap = mongoose.model("MentorStudentMap", mentorStudentMapSchema);
export default MentorStudentMap;
