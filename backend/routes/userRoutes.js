import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/multer.js";
import {
  getMyProfile,
  createProfile,
  completeProfile,
  logoutUser,
  requestHostUpgrade,
  approveHostUpgrade,
  getAllUsers,
  deactivateUser,
} from "../controllers/userController.js";

const router = express.Router();

// Public (after login)
router.get("/get-profile", authMiddleware, getMyProfile);
router.post("/create-profile", authMiddleware, createProfile);

// Complete/Update profile - unified endpoint
router.put(
  "/complete-profile",
  authMiddleware,
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "aadhaar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "drivingLicense", maxCount: 1 },
  ]),
  completeProfile
);

router.post("/logout", authMiddleware, logoutUser);

// Host request (optional flow)
router.put("/request-host", authMiddleware, requestHostUpgrade);

// Admin routes
router.put("/approve-host/:id", authMiddleware, requireRole("admin", "superadmin"), approveHostUpgrade);
router.get("/", authMiddleware, requireRole("admin", "superadmin"), getAllUsers);
router.put("/deactivate/:id", authMiddleware, requireRole("admin", "superadmin"), deactivateUser);

export default router;