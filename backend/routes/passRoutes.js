import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

import {
  addPass,
  updatePass,
  deletePass,
  getPasses
} from "../controllers/passController.js";

const router = express.Router();

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

export default router;
