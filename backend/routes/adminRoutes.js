import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  // approveEventHost,
  rejectEventHost,
  getAllHostRequests,
  getRequestById,
  getAllHosts,
  getHostIdFromRequestId,
  getEventTransactions,
} from "../controllers/adminController.js";
import { approveEventHostRequest } from "../controllers/hostController.js";
import { adminCreateEvent, getEvents } from "../controllers/eventController.js"; 
import { upload } from "../middleware/multer.js";
import { adminLogin, adminLogout, adminMe } from "../controllers/authController.js";

const router = express.Router();

// Admin authentication (no auth middleware needed - this is the login endpoint)
router.post("/auth/login", adminLogin);

// Admin session + logout
router.get("/auth/me", authMiddleware, requireRole("admin", "superadmin"), adminMe);
router.post("/auth/logout", authMiddleware, adminLogout);

// Host Request Routes
router.get("/host-requests", authMiddleware, requireRole("admin", "superadmin"), getAllHostRequests);
router.get("/host-requests/:id", authMiddleware, requireRole("admin", "superadmin"), getRequestById);

// OLD WAY OF APPROVING REQUESTS
// router.post("/host-requests/approve/:id", authMiddleware, requireRole("admin", "superadmin"), approveEventHost);


// NEW WAY OF APPROVING REQUESTS
router.put(
  "/approve-event-request/:id",
  authMiddleware,
  requireRole("admin", "superadmin"),
  approveEventHostRequest
);

router.post("/host-requests/reject/:id", authMiddleware, requireRole("admin", "superadmin"), rejectEventHost);

// Helper Routes
router.get("/hosts", authMiddleware, requireRole("admin", "superadmin"), getAllHosts);
router.get("/host-requests/:requestId/host-id", authMiddleware, requireRole("admin", "superadmin"), getHostIdFromRequestId);

// 🔥 Event Management Routes (Add these)
router.post("/create-event", authMiddleware, requireRole("admin", "superadmin"), upload.single("eventImage"), adminCreateEvent);
router.get("/events", authMiddleware, requireRole("admin", "superadmin"), getEvents);

// Get transactions for a specific event (admin)
router.get(
  "/events/:eventId/transactions",
  authMiddleware,
  requireRole("admin", "superadmin"),
  getEventTransactions
);

export default router;