// src/routes/eventRoutes.js
import express from "express";
import Event from "../models/Event.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/multer.js";
import { shareEvent } from "../controllers/eventShareController.js";
import { getEventDirections } from "../controllers/eventDirectionController.js";
import {
  addOrUpdateReview,
  getReviews,
} from "../controllers/eventReviewController.js";
import { deleteImage } from "../services/cloudinary.js";

import {
  getEvents,
  toggleSaveEvent,
  getSavedEvents,
  requestEventHosting,
  getPendingHostingRequests,
  approveHostingRequest,
  rejectHostingRequest,
} from "../controllers/eventController.js"; // consolidated controller

import { searchEvents } from "../controllers/eventSearchController.js";

const router = express.Router();

// === PUBLIC / USER SEARCH API (Main Feed) ===
router.get("/search", authMiddleware, searchEvents);

// === SAVE / UNSAVE EVENT ===
router.post("/:eventId/save", authMiddleware, toggleSaveEvent);

// === GET USER'S SAVED EVENTS ===
router.get("/saved-events", authMiddleware, getSavedEvents);

// === EVENT HOSTING REQUESTS ===
router.post(
  "/request-hosting",
  authMiddleware,
  requireRole("host"),
  requestEventHosting
);

// Admin routes for hosting requests
router.get(
  "/admin/requests",
  authMiddleware,
  requireRole("admin", "superadmin"),
  getPendingHostingRequests
);

router.put(
  "/admin/requests/:id/approve",
  authMiddleware,
  requireRole("admin", "superadmin"),
  approveHostingRequest
);

router.post(
  "/admin/requests/:id/reject",
  authMiddleware,
  requireRole("admin", "superadmin"),
  rejectHostingRequest
);

// SHARE EVENT
router.post("/:eventId/share", authMiddleware, shareEvent);

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
    try {
      const event = await Event.findById(req.params.eventId);
      if (!event) {
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });
      }

      // Cleanup Cloudinary image
      if (event.eventImage?.publicId) {
        await deleteImage(event.eventImage.publicId);
      }

      await Event.findByIdAndDelete(req.params.eventId);
      res.json({
        success: true,
        message: "Event deleted and images cleaned up",
      });
    } catch (error) {
      console.error("Delete Event Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete event" });
    }
  }
);

// Add AFTER existing routes
router.post("/:eventId/reviews", authMiddleware, addOrUpdateReview);

router.get("/:eventId/reviews", getReviews);

// Optional: Keep old /events for backward compatibility or remove
router.get("/events", authMiddleware, getEvents);

export default router;
