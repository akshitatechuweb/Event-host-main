import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { requestEventHostAccess } from "../controllers/hostController.js";
import { approveEventHost } from "../controllers/adminController.js";

const router = express.Router();

// Host → send request
router.post("/event-request", authMiddleware, requestEventHostAccess);

// Admin → approve request
router.put(
  "/approve-event-request/:id",
  authMiddleware,
  requireRole("admin", "superadmin"),
  approveEventHost
);

export default router;
