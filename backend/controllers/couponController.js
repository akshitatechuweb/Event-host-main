import Coupon from "../models/Coupon.js";
import Booking from "../models/Booking.js";

// Create a new coupon (Super Admin Only)
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      description,
      applicableEvents,
      minOrderAmount,
      maxDiscount,
      expiryDate,
      usageLimit,
      perUserLimit,
    } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({
        success: false,
        message: "Code, discountType, and discountValue are required",
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
      discountType,
      discountValue,
      description,
      applicableEvents: applicableEvents || [],
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      usageLimit: usageLimit || null,
      perUserLimit: perUserLimit || 1,
      createdBy: req.user._id,
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

// Apply a coupon code (for Checkout UI)
export const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal, eventId } = req.body;

    if (!code || subtotal === undefined || !eventId) {
      return res.status(400).json({
        success: false,
        message: "Code, subtotal, and eventId are required",
      });
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({
      code: normalizedCode,
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive coupon code",
      });
    }

    // 1. Validation: Expiry
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    // 2. Validation: Global Usage Limit
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    // 3. Validation: Event Restriction
    if (
      coupon.applicableEvents &&
      coupon.applicableEvents.length > 0 &&
      !coupon.applicableEvents.some((id) => id.toString() === eventId)
    ) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not valid for this event",
      });
    }

    // 4. Validation: Minimum Order Amount (on subtotal)
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Min order for this coupon is ₹${coupon.minOrderAmount}`,
      });
    }

    // 5. Validation: Per-User Limit
    // Check confirmed bookings for this user using this coupon
    const userUsageCount = await Booking.countDocuments({
      userId: req.user._id,
      appliedCouponCode: normalizedCode,
      status: "confirmed",
    });

    if (userUsageCount >= coupon.perUserLimit) {
      return res.status(400).json({
        success: false,
        message: `You have reached the usage limit for this coupon`,
      });
    }

    // Discount Calculation
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "FLAT_AMOUNT") {
      discount = coupon.discountValue;
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
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
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
    const coupons = await Coupon.find()
      .populate("applicableEvents", "eventName")
      .sort({ createdAt: -1 });
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
