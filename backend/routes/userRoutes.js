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
import User from "../models/User.js";

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

// Create admin/superadmin accounts (DEV ONLY)
router.post("/create-admin", async (req, res) => {
  try {
    // Create Admin (phone: 7777777777, OTP: 1234)
    await User.updateOne(
      { phone: "7777777777" },
      {
        $set: {
          name: "Admin",
          email: "admin@party.com",
          phone: "7777777777",
          role: "admin",
          isVerified: true,
          isHostVerified: true,
          isActive: true,
        },
      },
      { upsert: true }
    );

    // Create Super Admin (phone: 8888888888, OTP: 5678)
    await User.updateOne(
      { phone: "8888888888" },
      {
        $set: {
          name: "Super Admin",
          email: "superadmin@party.com",
          phone: "8888888888",
          role: "superadmin",
          isVerified: true,
          isHostVerified: true,
          isActive: true,
        },
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Admin accounts created successfully!",
      accounts: [
        {
          role: "admin",
          phone: "7777777777",
          otp: "1234",
          email: "admin@party.com"
        },
        {
          role: "superadmin",
          phone: "8888888888",
          otp: "5678",
          email: "superadmin@party.com"
        }
      ],
      note: "Use these phone numbers with their respective OTPs to login"
    });
  } catch (error) {
    console.error("Error creating admin accounts:", error);
    res.status(500).json({ success: false, message: "Failed to create admin accounts" });
  }
});

export default router;