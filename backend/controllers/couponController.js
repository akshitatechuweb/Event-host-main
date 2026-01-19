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



// Apply or Remove Coupon
export const applyCoupon = async (req, res) => {
  try {
    const { bookingId, couponCode } = req.body;

    // Validate bookingId
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check booking status
    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Coupon can only be applied to pending bookings",
      });
    }

    // Get original total (from items)
    let originalTotal = 0;
    for (const item of booking.items) {
      originalTotal += item.price * item.quantity;
    }

    // CASE 1: Remove coupon (couponCode is null, empty string, or "REMOVE")
    if (!couponCode || couponCode === "" || couponCode.toUpperCase() === "REMOVE") {
      booking.totalAmount = originalTotal;
      booking.subtotal = originalTotal;
      booking.discountAmount = 0;
      booking.taxAmount = 0;
      booking.appliedCouponCode = null;
      await booking.save();

      return res.json({
        success: true,
        message: "Coupon removed successfully",
        booking: {
          bookingId: booking._id,
          originalAmount: originalTotal,
          discountAmount: 0,
          finalAmount: originalTotal,
          appliedCoupon: null,
        },
      });
    }

    // CASE 2: Apply coupon
    const normalizedCode = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = Math.round((originalTotal * coupon.value) / 100);
    } else if (coupon.type === "FLAT_AMOUNT") {
      discountAmount = coupon.value;
    }

    // Cap discount at total amount (can't be negative)
    if (discountAmount > originalTotal) {
      discountAmount = originalTotal;
    }

    const finalAmount = originalTotal - discountAmount;

    // Update booking
    booking.subtotal = originalTotal;
    booking.discountAmount = discountAmount;
    booking.totalAmount = finalAmount;
    booking.taxAmount = 0; // You can add tax logic here if needed
    booking.appliedCouponCode = normalizedCode;
    await booking.save();

    return res.json({
      success: true,
      message: "Coupon applied successfully",
      booking: {
        bookingId: booking._id,
        originalAmount: originalTotal,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        appliedCoupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
        },
      },
    });
  } catch (error) {
    console.error("Apply Coupon Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to apply coupon",
      error: error.message,
    });
  }
};