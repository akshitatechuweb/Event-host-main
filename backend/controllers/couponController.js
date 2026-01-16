import Coupon from "../models/Coupon.js";

// Create a new coupon (Super Admin Only)
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      expiryDate,
      usageLimit,
    } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({
        success: false,
        message: "Code, discountType, and discountValue are required",
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    const coupon = new Coupon({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      usageLimit: usageLimit || null,
      createdBy: req.user._id, // Set by authMiddleware
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

// Apply a coupon code
export const applyCoupon = async (req, res) => {
  try {
    const { code, originalAmount } = req.body;

    if (!code || originalAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and originalAmount are required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive coupon code",
      });
    }

    // Validation: Expiry
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    // Validation: Usage Limit
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    // Validation: Minimum Order Amount
    if (originalAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
      });
    }

    // Discount Calculation
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (originalAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "FLAT_AMOUNT") {
      discount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed original amount
    if (discount > originalAmount) {
      discount = originalAmount;
    }

    const finalAmount = Math.max(0, originalAmount - discount);

    res.json({
      success: true,
      message: "Coupon applied successfully",
      originalAmount,
      discountApplied: discount,
      finalAmount,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
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
    const { isActive } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
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
