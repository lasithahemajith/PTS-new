import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getProfile } from "../controllers/userController.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import {
    createUser,
    getUsersByRole,
    mapMentorToStudent,
    getMappings,
    unmapMentorFromStudent,
    getAssignedStudents,
  } from "../controllers/userController.js";
  
const router = express.Router();

// All require auth
router.use(verifyToken);

router.get("/profile", verifyToken, getProfile);
// router.post("/", verifyToken, createUser); // Only Tutor
// router.get("/", verifyToken, getUsersByRole);
// router.post("/map", verifyToken, mapMentorToStudent);


// ✅ NEW endpoint for mentors
router.get("/assigned-students", verifyToken, getAssignedStudents);

// Tutor (admin) only
router.post("/", requireRole("Tutor"), createUser);
router.post("/map", requireRole("Tutor"), mapMentorToStudent);
router.delete("/map", requireRole("Tutor"), unmapMentorFromStudent);

// Anyone authenticated can list users (or restrict to Tutor if you prefer)
router.get("/", getUsersByRole);

// List mappings (restrict to Tutor if you prefer)
router.get("/mappings", getMappings);

export default router;
