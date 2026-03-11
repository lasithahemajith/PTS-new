import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["Class", "Practicum"], required: true },
    attended: { type: String, enum: ["Yes", "No"], required: true },
    reason: { type: String, default: null },
  },
  { timestamps: true }
);

attendanceSchema.index({ studentId: 1, createdAt: -1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
