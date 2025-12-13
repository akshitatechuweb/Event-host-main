import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ✅ ONLY NORMAL USERS can create & verify payments
router.post(
  "/create-order",
  authMiddleware,
  requireRole("user"),
  createOrder
);

router.post(
  "/verify-payment",
  authMiddleware,
  requireRole("user"),
  verifyPayment
);

export default router;
