// src/routes/eventRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/multer.js";
import { shareEvent } from "../controllers/eventShareController.js";

import { 
  adminCreateEvent, 
  adminUpdateEvent ,
  getEvents,
  toggleSaveEvent,        
  getSavedEvents,
} from "../controllers/eventController.js"; // your existing admin controller

import { searchEvents } from "../controllers/eventSearchController.js";

const router = express.Router();

// === PUBLIC / USER SEARCH API (Main Feed) ===
router.get("/search", searchEvents); // No auth required or optional auth for personalization

// === ADMIN ROUTES ===
router.post(
  "/create-event",
  authMiddleware,
  requireRole("admin", "superadmin"),
  upload.single("eventImage"),
  adminCreateEvent
);

router.put(
  "/update-event/:eventId",
  authMiddleware,
  requireRole("admin", "superadmin"),
  upload.single("eventImage"),
  adminUpdateEvent
);


// === SAVE / UNSAVE EVENT ===
router.post(
  "/:eventId/save",
  authMiddleware,
  toggleSaveEvent
);

// === GET USER'S SAVED EVENTS ===
router.get(
  "/saved-events",
  authMiddleware,
  getSavedEvents
);




// SHARE EVENT
router.post(
  "/:eventId/share",
  authMiddleware, 
  shareEvent
);


// Optional: Keep old /events for backward compatibility or remove
router.get("/events", authMiddleware, getEvents);

export default router;