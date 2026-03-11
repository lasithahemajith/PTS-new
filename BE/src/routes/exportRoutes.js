import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  exportAllLogsExcel,
  exportAllLogsCSV,
  exportAllLogsJSON,
} from "../controllers/exportController.js";

const router = express.Router();

// Practicum Log export endpoints
router.get("/excel", verifyToken, exportAllLogsExcel);
router.get("/csv", verifyToken, exportAllLogsCSV);
router.get("/json", verifyToken, exportAllLogsJSON);

export default router;
