import mongoose from "mongoose";

export const connectMongo = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI in .env");
  }

  mongoose.set("strictQuery", false);
  const conn = await mongoose.connect(uri);
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
};
