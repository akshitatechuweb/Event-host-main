// src/routes/eventRoutes.js
import express from "express";
import Event from "../models/Event.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/multer.js";
import { shareEvent } from "../controllers/eventShareController.js";
import { getEventDirections } from "../controllers/eventDirectionController.js";
import { addOrUpdateReview, getReviews } from "../controllers/eventReviewController.js";

import { 

  getEvents,
  toggleSaveEvent,        
  getSavedEvents,
} from "../controllers/eventController.js"; // your existing admin controller

import { searchEvents } from "../controllers/eventSearchController.js";

const router = express.Router();

// === PUBLIC / USER SEARCH API (Main Feed) ===
router.get("/search", authMiddleware, searchEvents); 




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

// GET EVENT DIRECTIONS
router.get(
  "/:eventId/directions",
  getEventDirections // public (no auth needed)
);


router.delete(
  "/delete-event/:eventId",
  authMiddleware,
  requireRole("admin", "superadmin"),
  async (req, res) => {
    const event = await Event.findByIdAndDelete(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, message: "Event deleted" });
  }
);




// Add AFTER existing routes
router.post(
  "/:eventId/reviews",
  authMiddleware,
  addOrUpdateReview
);

router.get(
  "/:eventId/reviews",
  getReviews
);




// Optional: Keep old /events for backward compatibility or remove
router.get("/events", authMiddleware, getEvents);

export default router;