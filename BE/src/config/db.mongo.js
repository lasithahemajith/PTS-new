import mongoose from "mongoose";

export const connectMongo = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("❌ Missing MONGODB_URI in .env");
      return;
    }

    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
  }
};
