import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userName: { type: String, default: "Unknown" },
    userRole: {
      type: String,
      enum: ["Student", "Mentor", "Tutor", "System"],
      default: "System",
    },
    action: { type: String, required: true },
    resource: { type: String, default: null },
    resourceId: { type: String, default: null },
    details: { type: String, default: null },
    ipAddress: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
