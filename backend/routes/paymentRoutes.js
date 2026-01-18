import express from "express";
import {
  createOrder,
  verifyPayment,
  initiatePhonePePayment,
  checkPhonePeStatus,
  phonePeCallback,
  handlePhonePeRedirect,
  applyCouponToOrder,
  removeCouponFromOrder,
  verifyPayment,
} from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ✅ ONLY NORMAL USERS can create & verify payments
router.post(
  "/create-order",
  authMiddleware,
  requireRole("user", "host", "admin", "superadmin"),
  createOrder,
);

router.post(
  "/verify-payment",
  authMiddleware,
  requireRole("user", "host", "admin", "superadmin"),
  verifyPayment,
);

// 📱 PhonePe Specific Routes
router.post(
  "/phonepe/initiate",
  authMiddleware,
  requireRole("user", "host", "admin", "superadmin"),
  initiatePhonePePayment,
);

router.get(
  "/phonepe/status/:transactionId",
  authMiddleware,
  requireRole("user", "host", "admin", "superadmin"),
  checkPhonePeStatus,
);

router.post("/phonepe/callback", phonePeCallback);

// 📱 PhonePe Redirect Handler (Backend -> Frontend)
router.post("/phonepe/handle-redirect", handlePhonePeRedirect);
router.get("/phonepe/handle-redirect", handlePhonePeRedirect);

export default router;
