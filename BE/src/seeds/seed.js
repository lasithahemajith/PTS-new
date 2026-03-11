import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Inline User schema to avoid circular import issues when running standalone
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Student", "Mentor", "Tutor"], required: true },
    phone: { type: String, default: null },
    studentIndex: { type: String, unique: true, sparse: true, default: null },
    company: { type: String, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ Missing MONGODB_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  const email = process.env.SUPERADMIN_EMAIL || "admin@eit.ac.nz";
  const plainPassword = process.env.SUPERADMIN_PASSWORD || "Admin@123";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await User.findOneAndUpdate(
    { email },
    {
      $setOnInsert: {
        name: "Main Tutor",
        email,
        password: hashedPassword,
        role: "Tutor",
      },
    },
    { upsert: true, new: true }
  );

  console.log(`✅ Super Admin seeded: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
