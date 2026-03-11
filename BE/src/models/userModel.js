import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "mentor", "tutor"],
      default: "student",
    },
    mentorId: { type: Number }, // ✅ add this (mentor’s user.id from MySQL or other system)

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
