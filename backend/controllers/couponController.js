import Coupon from "../models/Coupon.js";
import Booking from "../models/Booking.js";

// Create a new coupon (Super Admin Only)
export const createCoupon = async (req, res) => {
  try {
    const { code, type, value, usage_limit, expiry_date } = req.body;

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
      usage_limit: usage_limit || null,
      expiry_date: expiry_date ? new Date(expiry_date) : null,
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: "Global Coupon created successfully",
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

// Apply a coupon code (for Checkout UI)
export const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || subtotal === undefined) {
      return res.status(400).json({
        success: false,
        message: "Code and subtotal are required",
      });
    }

    if (subtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Coupons cannot be applied to free events",
      });
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({
      code: normalizedCode,
      is_active: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive coupon code",
      });
    }

    // 1. Validation: Expiry
    if (coupon.expiry_date && new Date() > coupon.expiry_date) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    // 2. Validation: Global Usage Limit
    if (
      coupon.usage_limit !== null &&
      coupon.usageCount >= coupon.usage_limit
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    // Discount Calculation
    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = (subtotal * coupon.value) / 100;
    } else if (coupon.type === "FLAT_AMOUNT") {
      discount = coupon.value;
    }

    // Ensure discount doesn't exceed subtotal
    if (discount > subtotal) {
      discount = subtotal;
    }

    // Financial Breakdown Patterns (following UI):
    //パターン: Subtotal -> Discount -> Tax (10%) -> Total
    const discountedAmount = subtotal - discount;
    const taxRate = 0.1; // 10% as seen in UI
    const taxAmount = Math.round(discountedAmount * taxRate);
    const finalTotal = discountedAmount + taxAmount;

    res.json({
      success: true,
      message: "Coupon applied!",
      summary: {
        subtotal,
        discountedBy: discount,
        taxAmount,
        total: finalTotal,
      },
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
    });
  } catch (error) {
    console.error("Apply Coupon Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to apply coupon",
      error: error.message,
    });
  }
};

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

// Update coupon status
export const updateCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { is_active },
      { new: true },
    );
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    res.json({ success: true, message: "Coupon status updated", coupon });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update coupon status",
      error: error.message,
    });
  }
};

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
