import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  applyCoupon, // ✅ Add this
} from "../controllers/couponController.js";

const router = express.Router();

// Apply/Remove coupon (Public or with auth, your choice)
router.post("/apply", applyCoupon); // ✅ Add this route

// Admin routes (if you have them)
// router.post("/create", authMiddleware, createCoupon);
// router.get("/all", authMiddleware, getAllCoupons);
// router.delete("/:id", authMiddleware, deleteCoupon);

export default router;