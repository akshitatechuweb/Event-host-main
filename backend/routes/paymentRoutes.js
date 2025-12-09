// routes/paymentRoutes.js
import express from "express";
import { createBookingOrder, verifyBookingPayment } from "../controllers/paymentController.js";

const router = express.Router();


router.post("/create-order", createBookingOrder);
router.post("/verify-payment", verifyBookingPayment);

export default router;