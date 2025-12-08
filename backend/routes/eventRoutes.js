import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { adminCreateEvent, getEvents } from "../controllers/eventController.js";
import { upload } from "../middleware/multer.js"

const router = express.Router();

// Admin creates event (with image upload)
router.post(
  "/create-event",
  authMiddleware,
  requireRole("admin", "superadmin"),
  upload.single("eventImage"),
  adminCreateEvent
);

// Get all events or trending nearby
router.get("/events", authMiddleware, getEvents);

export default router;
