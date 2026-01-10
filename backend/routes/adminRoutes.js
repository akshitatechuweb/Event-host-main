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
  getDashboardStats,
  getAllTickets
} from "../controllers/adminController.js";
import { getEvents } from "../controllers/eventController.js";
import { getPasses } from "../controllers/passController.js";
import {
  createEvent,
  updateEvent,
  updateAdminProfile,
  updateAdminPassword,
} from "../controllers/adminController.js";
const router = express.Router();

// Admin authentication
router.post("/auth/login", adminLogin);
router.get("/auth/me", authMiddleware, requireRole("admin", "superadmin"), adminMe);
router.post("/auth/logout", authMiddleware, adminLogout);

// Profile management
router.put(
  "/profile",
  authMiddleware,
  requireRole("admin", "superadmin"),
  upload.single("profileImage"),
  updateAdminProfile
);
router.put(
  "/auth/change-password",
  authMiddleware,
  requireRole("admin", "superadmin"),
  updateAdminPassword
);

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



router.get(
  "/events",
  authMiddleware,
  requireRole("admin", "superadmin"),
  getEvents
);

// GET: All tickets or tickets by Event ID
router.get("/tickets", authMiddleware, requireRole("admin", "superadmin"), (req, res, next) => {
  if (req.query.eventId) {
    return getPasses(req, res, next);
  }
  return getAllTickets(req, res, next);
});



router.post(
  "/event/create-event",
  authMiddleware,
  requireRole("admin", "superadmin"),
  upload.single("eventImage"),
  createEvent
);

router.put(
  "/event/update-event/:eventId",
  authMiddleware,
  requireRole("admin", "superadmin"),
  upload.single("eventImage"),
  updateEvent
);

export default router;