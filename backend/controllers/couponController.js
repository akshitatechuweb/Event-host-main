import Coupon from "../models/Coupon.js";
import Booking from "../models/Booking.js";

// Create a new coupon (Super Admin Only)
export const createCoupon = async (req, res) => {
  try {
    const { code, type, value } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Code, type, and value are required",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: normalizedCode });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    const coupon = new Coupon({
      code: normalizedCode,
      type,
      value,
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Create Coupon Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
      error: error.message,
    });
  }
};

// Standalone applyCoupon removed - integrated into payment flow

// Get all coupons (Admin only)
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
      error: error.message,
    });
  }
};

// Standalone status update removed as is_active field is removed

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }
    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
