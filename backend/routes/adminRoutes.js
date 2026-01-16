import express from "express";
import {
  authMiddleware,
  checkPermission,
} from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/multer.js";
import {
  adminLogin,
  adminLogout,
  adminMe,
} from "../controllers/authController.js";
import {
  createAdmin,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
} from "../controllers/superAdminController.js";
import {
  getAllHostRequests,
  getRequestById,
  approveEventHost,
  rejectEventHost,
  getEventTransactions,
  getDashboardStats,
  getAllTickets,
  getAllHosts,
  getAllUsers,
  deactivateUser,
  createEvent,
  updateEvent,
  updateAdminProfile,
  updateAdminPassword,
} from "../controllers/adminController.js";
import { getUserById } from "../controllers/userController.js";
import { getEvents, getHostEvents } from "../controllers/eventController.js";
import { getPasses } from "../controllers/passController.js";
  createCoupon,
  getAllCoupons,
  updateCouponStatus,
  deleteCoupon,
} from "../controllers/couponController.js";
const router = express.Router();

// Admin authentication
router.post("/auth/login", adminLogin);
router.get(
  "/auth/me",
  authMiddleware,
  requireRole("admin", "superadmin"),
  adminMe
);
router.get(
  "/profile",
  authMiddleware,
  requireRole("admin", "superadmin"),
  adminMe
);
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
router.get(
  "/dashboard/stats",
  authMiddleware,
  requireRole("admin", "superadmin"),
  getDashboardStats
);

// ===============================
// HOST REQUESTS MANAGEMENT
// ===============================

// Get all host requests
router.get(
  "/host-requests",
  authMiddleware,
  requireRole("admin", "superadmin"),
  checkPermission("hosts", "read"),
  getAllHostRequests
);

// Get single request details
router.get(
  "/host-requests/:id",
  authMiddleware,
  requireRole("admin", "superadmin"),
  checkPermission("hosts", "read"),
  getRequestById
);

// Approve host request
router.put(
  "/approve-event-request/:id",
  authMiddleware,
  requireRole("admin", "superadmin"),
  checkPermission("hosts", "write"),
  approveEventHost
);

// Reject host request
router.post(
  "/host-requests/reject/:id",
  authMiddleware,
  requireRole("admin", "superadmin"),
  checkPermission("hosts", "write"),
  rejectEventHost
);

// Get all approved hosts (for events)
router.get(
  "/all-hosts",
  authMiddleware,
  requireRole("admin", "superadmin"),
  checkPermission("hosts", "read"),
  getAllHosts
);

// ===============================
// EVENT TRANSACTIONS
// ===============================
router.get(
  "/events/:eventId/transactions",
  authMiddleware,
  requireRole("admin", "superadmin"),
  checkPermission("transactions", "read"),
  getEventTransactions
);

router.get(
  "/events",
  authMiddleware,
  requireRole("admin", "superadmin"),
  checkPermission("events", "read"),
  getEvents
);

// GET: All tickets or tickets by Event ID
router.get(
  "/tickets",
  authMiddleware,
  requireRole("admin", "superadmin"),
  checkPermission("tickets", "read"),
  (req, res, next) => {
    if (req.query.eventId) {
      return getPasses(req, res, next);
    }
    return getAllTickets(req, res, next);
  }
);

router.post(
  "/event/create-event",
  authMiddleware,
  requireRole("admin", "superadmin"),
  checkPermission("events", "write"),
  upload.single("eventImage"),
  createEvent
);

router.put(
  "/event/update-event/:eventId",
  authMiddleware,
  requireRole("admin", "superadmin"),
  checkPermission("events", "write"),
  upload.single("eventImage"),
  updateEvent
);

// ===============================
// APP USERS MANAGEMENT
// ===============================
router.get(
  "/app-users",
  authMiddleware,
  requireRole("admin", "superadmin"),
  checkPermission("users", "read"),
  getAllUsers
);

// Get single app user (Admin)
router.get(
  "/app-users/:id",
  authMiddleware,
  requireRole("admin", "superadmin"),
  checkPermission("users", "read"),
  getUserById
);

router.put(
  "/app-users/deactivate/:id",
  authMiddleware,
  requireRole("admin", "superadmin"),
  checkPermission("users", "write"),
  deactivateUser
);

// ===============================
// SUPER ADMIN MANAGEMENT
// ===============================
router.post("/admins", authMiddleware, requireRole("superadmin"), createAdmin);

router.get("/admins", authMiddleware, requireRole("superadmin"), getAllAdmins);

router.put(
  "/admins/:id",
  authMiddleware,
  requireRole("superadmin"),
  updateAdmin
);

router.delete(
  "/admins/:id",
  authMiddleware,
  requireRole("superadmin"),
  deleteAdmin
);

// ===============================
// COUPON MANAGEMENT
// ===============================
router.post(
  "/coupons",
  authMiddleware,
  requireRole("superadmin"),
  createCoupon
);

router.get(
  "/coupons",
  authMiddleware,
  requireRole("admin", "superadmin"),
  getAllCoupons
);

  updateCouponStatus
);

router.delete(
  "/coupons/:id",
  authMiddleware,
  requireRole("superadmin"),
  deleteCoupon
);

router.get(
  "/hosts/:hostId/events",
  authMiddleware,
  requireRole("admin", "superadmin"),
  checkPermission("events", "read"),
  getHostEvents
);

export default router;
