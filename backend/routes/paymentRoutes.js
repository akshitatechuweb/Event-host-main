// routes/paymentRoutes.js
import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; // adjust path if needed

const router = express.Router();

// authMiddleware is now optional → allows both guests and logged-in users
router.post("/create-order", authMiddleware, createOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);

export default router;