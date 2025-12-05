import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  createEvent,
  approveEvent,
  rejectEvent,
  getAllEvents,
  getMyEvents,
  updateEventByAdmin,
  getVerifiedEvents,
} from "../controllers/eventController.js";

const router = express.Router();

// Host: create and manage own events
router.post("/", authMiddleware, createEvent);
router.get("/", authMiddleware, getAllEvents);
router.get("/my-events", authMiddleware, getMyEvents);

// Admin: approve or reject events
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin", "superadmin"),
  updateEventByAdmin
);
router.put(
  "/:id/approve",
  authMiddleware,
  requireRole("admin", "superadmin"),
  approveEvent
);
router.put(
  "/:id/reject",
  authMiddleware,
  requireRole("admin", "superadmin"),
  rejectEvent
);

router.get("/verified/all", authMiddleware, getVerifiedEvents);

export default router;
