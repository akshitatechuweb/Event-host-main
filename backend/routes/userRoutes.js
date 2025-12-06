import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  getMyProfile,
  getUserById,
  updateUserProfile,
  getAllUsers,
  deactivateUser,
  requestHostUpgrade,
  approveHostUpgrade,
  createProfile,
    logoutUser
} from "../controllers/userController.js";

const router = express.Router();

// Protected routes
router.get("/get-profile", authMiddleware, getMyProfile);
router.put("/update-profile", authMiddleware, updateUserProfile);
router.put("/deactivate/:id", authMiddleware, deactivateUser);
router.put("/request-host", authMiddleware, requestHostUpgrade);

// Admin/moderator-only routes (can restrict later with role middleware)

router.put(
  "/approve-host/:id",
  authMiddleware,
  requireRole("admin", "superadmin"),
  approveHostUpgrade
);

router.get(
  "/",
  authMiddleware,
  requireRole("admin", "superadmin"),
  getAllUsers
);
router.get(
  "/:id",
  authMiddleware,
  requireRole("admin", "superadmin"),
  getUserById
);

router.post("/create-profile", authMiddleware, createProfile);
router.post("/logout", authMiddleware, logoutUser);
export default router;
