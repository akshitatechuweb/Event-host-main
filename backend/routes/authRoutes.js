import express from "express";
import {
  requestOtp,
  verifyOtp,
  logout,
  getMe,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

export default router;
