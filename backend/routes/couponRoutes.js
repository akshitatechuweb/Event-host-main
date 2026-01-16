import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { applyCoupon } from "../controllers/couponController.js";

const router = express.Router();

// Publicly accessible to authenticated users
router.post("/apply", authMiddleware, applyCoupon);

export default router;
