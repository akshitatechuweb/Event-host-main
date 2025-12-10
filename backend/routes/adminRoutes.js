import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  approveEventHost,
  rejectEventHost,
  getAllHostRequests,
  getRequestById,
  getAllHosts,
  getHostIdFromRequestId,
} from "../controllers/adminController.js";
import { adminCreateEvent, getEvents } from "../controllers/eventController.js";  // ← Add this
import { upload } from "../middleware/multer.js";  // ← Add this

const router = express.Router();

// Host Request Routes
router.get("/host-requests", authMiddleware, requireRole("admin", "superadmin"), getAllHostRequests);
router.get("/host-requests/:id", authMiddleware, requireRole("admin", "superadmin"), getRequestById);
router.post("/host-requests/approve/:id", authMiddleware, requireRole("admin", "superadmin"), approveEventHost);
router.post("/host-requests/reject/:id", authMiddleware, requireRole("admin", "superadmin"), rejectEventHost);

// Helper Routes
router.get("/hosts", authMiddleware, requireRole("admin", "superadmin"), getAllHosts);
router.get("/host-requests/:requestId/host-id", authMiddleware, requireRole("admin", "superadmin"), getHostIdFromRequestId);

// 🔥 Event Management Routes (Add these)
router.post("/create-event", authMiddleware, requireRole("admin", "superadmin"), upload.single("eventImage"), adminCreateEvent);
router.get("/events", authMiddleware, requireRole("admin", "superadmin"), getEvents);

export default router;