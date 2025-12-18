import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

import {
  addPass,
  updatePass,
  deletePass,
  getPasses,
  getMyPurchasedPasses,
  getMyPassesForEvent
} from "../controllers/passController.js";
import { downloadPassTicket } from "../controllers/passController.js";

const router = express.Router();

// ===============================
// USER ROUTES (for purchased passes)
// ===============================

// Get all purchased passes for logged-in user
router.get("/my-passes", authMiddleware, getMyPurchasedPasses);

// Get user's purchased passes for a specific event
router.get("/my-passes/:eventId", authMiddleware, getMyPassesForEvent);


// ===============================
// ADMIN ROUTES (for pass management)
// ===============================

// Get all passes for an event
router.get("/:eventId", authMiddleware, getPasses);

// Add a new pass
router.post(
  "/:eventId",
  authMiddleware,
  requireRole("admin", "superadmin"),
  addPass
);

// Update a pass
router.put(
  "/:eventId/:passId",
  authMiddleware,
  requireRole("admin", "superadmin"),
  updatePass
);

// Delete a pass
router.delete(
  "/:eventId/:passId",
  authMiddleware,
  requireRole("admin", "superadmin"),
  deletePass
);




// Download ticket PDF for a specific booking
router.get("/my-passes/download/:bookingId", authMiddleware, downloadPassTicket);
export default router;