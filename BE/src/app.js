import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectMongo } from "./config/db.mongo.js";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import logPaperRoutes from "./routes/logPaperRoutes.js";
import path from "path";  // ✅ Add this line
import mentorFeedbackRoutes from "./routes/mentorFeedbackRoutes.js";
import tutorFeedbackRoutes from "./routes/tutorFeedbackRoutes.js";
import tutorDashboardRoutes from "./routes/tutorDashboardRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

await new Promise(r => setTimeout(r, 5000)); // wait 5s for MySQL & Mongo
dotenv.config(); // ✅ must come before connectMongo()

const app = express();
const prisma = new PrismaClient();

// ✅ Serve static uploads
app.use("/uploads", express.static(path.resolve("uploads")));

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/api/users", userRoutes);

app.use("/logpaper", logPaperRoutes);


app.use("/mentor-feedback", mentorFeedbackRoutes);

app.use("/api/tutor-feedback", tutorFeedbackRoutes);

app.use("/tutor", tutorDashboardRoutes);

app.use("/api/export/logs", exportRoutes);

app.use("/attendance", attendanceRoutes);

app.use("/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Practicum Tracker API Running" });
});

await connectMongo(); // ✅ connect before routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
