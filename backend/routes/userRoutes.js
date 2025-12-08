import express from "express";
import User from "../models/User.js"
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/multer.js";
import {
  getMyProfile,
  getUserById,
 
  getAllUsers,
  deactivateUser,
  requestHostUpgrade,
  approveHostUpgrade,
  createProfile,
    logoutUser,
      completeProfile

} from "../controllers/userController.js";

const router = express.Router();

// Protected routes
router.get("/get-profile", authMiddleware, getMyProfile);
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





router.post("/create-admin", async (req, res) => {
  const admin = await User.create({
    name: "Admin",
    phone: req.body.phone,
    email: "admin@party.com",
    role: "admin",
    isVerified: true
  });

  res.json(admin);
});


export default router;
