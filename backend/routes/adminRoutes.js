import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/multer.js";
import { adminLogin, adminLogout, adminMe } from "../controllers/authController.js";
import {
  getAllHostRequests,
  getRequestById,
  approveEventHost,
  rejectEventHost,
  getEventTransactions,
  getDashboardStats
} from "../controllers/adminController.js";
import { adminCreateEvent, getEvents } from "../controllers/eventController.js";

const router = express.Router();

// Admin authentication
router.post("/auth/login", adminLogin);
router.get("/auth/me", authMiddleware, requireRole("admin", "superadmin"), adminMe);
router.post("/auth/logout", authMiddleware, adminLogout);

// Dashboard stats endpoint
router.get("/dashboard/stats", authMiddleware, requireRole("admin", "superadmin"), getDashboardStats);

// ===============================
// HOST REQUESTS MANAGEMENT
// ===============================

// Get all host requests
router.get(
  "/host-requests",
  authMiddleware,
  requireRole("admin", "superadmin"),
  getAllHostRequests
);

// Get single request details
router.get(
  "/host-requests/:id",
  authMiddleware,
  requireRole("admin", "superadmin"),
  getRequestById
);

// Approve host request
router.put(
  "/approve-event-request/:id",
  authMiddleware,
  requireRole("admin", "superadmin"),
  approveEventHost
);

// Reject host request
router.post(
  "/host-requests/reject/:id",
  authMiddleware,
  requireRole("admin", "superadmin"),
  rejectEventHost
);

// ===============================
// EVENT TRANSACTIONS
// ===============================
router.get(
  "/events/:eventId/transactions",
  authMiddleware,
  requireRole("admin", "superadmin"),
  getEventTransactions
);


router.post(
  "/create-event",
  authMiddleware,
  requireRole("admin", "superadmin"),
  upload.single("eventImage"),
  adminCreateEvent
);

router.get(
  "/events",
  authMiddleware,
  requireRole("admin", "superadmin"),
  getEvents
);

export default router;