// routes/userRoutes.js
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


router.post("/create-admin", async (req, res) => {
  try {
    const phone = "7023258752";

    await User.updateOne(
      { phone },
      {
        $set: {
          name: "Super Admin",
          email: "admin@party.com",
          phone,
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
      message: "Super Admin is ready!",
      phone: "7023258752",
      login: "Use 7023258752 + OTP to login as Super Admin",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
});

export default router;