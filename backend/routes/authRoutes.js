import express from "express";
import {
  requestOtp,
  verifyOtp,
} from "../controllers/authController.js";

const router = express.Router();

/* =========================
   📲 USER OTP AUTH ONLY
========================= */

// Request OTP
router.post("/request-otp", requestOtp);

// Verify OTP
router.post("/verify-otp", verifyOtp);

export default router;
