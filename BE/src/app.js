import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectMongo } from "./config/db.mongo.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import logPaperRoutes from "./routes/logPaperRoutes.js";
import path from "path";
import mentorFeedbackRoutes from "./routes/mentorFeedbackRoutes.js";
import tutorFeedbackRoutes from "./routes/tutorFeedbackRoutes.js";
import tutorDashboardRoutes from "./routes/tutorDashboardRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


dotenv.config();

const app = express();

// Serve static uploads
app.use("/uploads", express.static(path.resolve("uploads")));

app.use(cors());
app.use(express.json());

// Routes
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
app.use("/audit", auditLogRoutes);
app.use("/notifications", notificationRoutes);


// Connect MongoDB then start server
connectMongo()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
