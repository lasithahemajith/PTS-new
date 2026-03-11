import ExcelJS from "exceljs";
import { Parser as Json2CsvParser } from "json2csv";
import LogPaper from "../models/logPaperModel.js";
import TutorFeedback from "../models/tutorFeedbackModel.js";

/**
 * Utility: gather all log data with mentor and tutor feedbacks
 */
const getAllLogsData = async () => {
  const logs = await LogPaper.find().sort({ createdAt: -1 }).lean();

  // Fetch all tutor feedbacks
  const tutorFeedbacks = await TutorFeedback.find().lean();

  // Map tutor feedbacks by logPaperId
  const feedbackMap = {};
  tutorFeedbacks.forEach((fb) => {
    const key = fb.logPaperId?.toString();
    if (!feedbackMap[key]) feedbackMap[key] = [];
    feedbackMap[key].push({
      tutorId: fb.tutorId,
      feedback: fb.feedback,
      createdAt: fb.createdAt,
    });
  });

  // Combine all data
  const combined = logs.map((log) => ({
    logPaperId: log._id?.toString(),
    studentId: log.studentId,
    activity: log.activity,
    description: log.description,
    mentorComment: log.mentorComment || "—",
    tutorFeedbacks: feedbackMap[log._id?.toString()] || [],
    status: log.status,
    date: log.date ? new Date(log.date).toLocaleDateString() : "—",
    reviewedAt: log.reviewedAt
      ? new Date(log.reviewedAt).toLocaleString()
      : "—",
    updatedAt: log.updatedAt
      ? new Date(log.updatedAt).toLocaleString()
      : "—",
  }));

  return combined;
};

/**
 * ✅ Export All Logs as Excel
 */
export const exportAllLogsExcel = async (req, res) => {
  try {
    const data = await getAllLogsData();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Practicum Logs");

    worksheet.columns = [
      { header: "LogPaper ID", key: "logPaperId", width: 30 },
      { header: "Student ID", key: "studentId", width: 15 },
      { header: "Activity", key: "activity", width: 25 },
      { header: "Description", key: "description", width: 40 },
      { header: "Mentor Feedback", key: "mentorComment", width: 40 },
      { header: "Tutor Feedbacks", key: "tutorFeedbacks", width: 60 },
      { header: "Status", key: "status", width: 15 },
      { header: "Date", key: "date", width: 20 },
      { header: "Reviewed At", key: "reviewedAt", width: 25 },
    ];

    data.forEach((d) => {
      worksheet.addRow({
        ...d,
        tutorFeedbacks:
          d.tutorFeedbacks.length > 0
            ? d.tutorFeedbacks
                .map(
                  (f) =>
                    `Tutor ${f.tutorId}: ${f.feedback} (${new Date(
                      f.createdAt
                    ).toLocaleString()})`
                )
                .join("\n")
            : "—",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=practicum_logs.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("❌ exportAllLogsExcel error:", err);
    res.status(500).json({ error: "Failed to export logs to Excel" });
  }
};

/**
 * ✅ Export All Logs as CSV
 */
export const exportAllLogsCSV = async (req, res) => {
  try {
    const data = await getAllLogsData();

    // Flatten tutor feedbacks for CSV readability
    const flattened = data.map((d) => ({
      ...d,
      tutorFeedbacks: d.tutorFeedbacks
        .map((f) => `Tutor ${f.tutorId}: ${f.feedback}`)
        .join("; "),
    }));

    const fields = [
      "logPaperId",
      "studentId",
      "activity",
      "description",
      "mentorComment",
      "tutorFeedbacks",
      "status",
      "date",
      "reviewedAt",
    ];

    const json2csv = new Json2CsvParser({ fields });
    const csv = json2csv.parse(flattened);

    res.header("Content-Type", "text/csv");
    res.attachment("practicum_logs.csv");
    res.send(csv);
  } catch (err) {
    console.error("❌ exportAllLogsCSV error:", err);
    res.status(500).json({ error: "Failed to export logs to CSV" });
  }
};

/**
 * ✅ Export All Logs as JSON
 */
export const exportAllLogsJSON = async (req, res) => {
  try {
    const data = await getAllLogsData();
    res.header("Content-Type", "application/json");
    res.attachment("practicum_logs.json");
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ exportAllLogsJSON error:", err);
    res.status(500).json({ error: "Failed to export logs to JSON" });
  }
};
