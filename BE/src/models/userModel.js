import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Student", "Mentor", "Tutor"],
      required: true,
    },
    phone: { type: String, default: null },
    studentIndex: { type: String, unique: true, sparse: true },
    company: { type: String, default: null },
    mustChangePassword: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default mongoose.model("User", userSchema);
