import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { 
  adminCreateEvent, 
  adminUpdateEvent, 
  getEvents 
} from "../controllers/eventController.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

// Admin/Superadmin creates event (with image upload)
router.post(
  "/create-event",
  authMiddleware,
  requireRole("admin", "superadmin"),
  upload.single("eventImage"),
  adminCreateEvent
);

// Admin/Superadmin updates event
router.put(
  "/update-event/:eventId",
  authMiddleware,
  requireRole("admin", "superadmin"),
  upload.single("eventImage"),
  adminUpdateEvent
);

// Get all events or trending nearby
router.get("/events", authMiddleware, getEvents);

export default router;