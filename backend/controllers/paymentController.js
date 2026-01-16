import Razorpay from "razorpay";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import GeneratedTicket from "../models/GeneratedTicket.js";
import Transaction from "../models/Transaction.js";
import { broadcastNotification } from "./sseController.js";

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =====================================================
   CREATE ORDER
===================================================== */
export const createOrder = async (req, res) => {
  try {
    const { eventId, items = [], attendees = [], couponCode } = req.body;
    const userId = req.user?._id || null;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "items must be a non-empty array",
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Build pass map
    const passMap = {};
    event.passes.forEach((p) => {
      passMap[p.type] = p;
    });

    let totalAmount = 0;
    let totalPersons = 0;

    for (const item of items) {
      const pass = passMap[item.passType];

      if (!pass) {
        return res.status(400).json({
          success: false,
          message: `${item.passType} pass not available`,
        });
      }

      // Security: price validation
      if (pass.price !== item.price) {
        return res.status(400).json({
          success: false,
          message: "Ticket price mismatch",
        });
      }

      totalAmount += pass.price * item.quantity;
      totalPersons +=
        item.passType === "Couple" ? item.quantity * 2 : item.quantity;
    }

    const subtotal = totalAmount;
    let discountAmount = 0;
    let taxAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const Coupon = (await import("../models/Coupon.js")).default;
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
      });

      if (coupon) {
        const isEligible =
          (!coupon.expiryDate || new Date() <= coupon.expiryDate) &&
          (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit);

        const isEventEligible =
          !coupon.applicableEvents ||
          coupon.applicableEvents.length === 0 ||
          coupon.applicableEvents.some((id) => id.toString() === eventId);

        if (
          isEligible &&
          isEventEligible &&
          subtotal >= coupon.minOrderAmount
        ) {
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (subtotal * coupon.discountValue) / 100;
            if (
              coupon.maxDiscount !== null &&
              discountAmount > coupon.maxDiscount
            ) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }
          if (discountAmount > subtotal) discountAmount = subtotal;
          appliedCoupon = coupon.code;
        }
      }
    }

    const discountedAmount = subtotal - discountAmount;
    taxAmount = Math.round(discountedAmount * 0.1); // 10% tax
    const finalAmount = discountedAmount + taxAmount;

    const order = await razorpay.orders.create({
      amount: finalAmount * 100,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: finalAmount,
      subtotal,
      discountAmount,
      taxAmount,
      couponCode: appliedCoupon,
      key_id: process.env.RAZORPAY_KEY_ID,
      eventName: event.eventName,
      ticketCount: totalPersons,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =====================================================
   VERIFY PAYMENT
===================================================== */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      eventId,
      items = [],
      attendees = [],
      subtotal,
      discountAmount,
      taxAmount,
      appliedCouponCode,
    } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "razorpay_order_id is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "items must be a non-empty array",
      });
    }

    const userId = req.user?._id || null;

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Build pass map
    const passMap = {};
    event.passes.forEach((p) => {
      passMap[p.type] = p;
    });

    let totalPersons = 0;
    let totalAmount = 0;

    for (const item of items) {
      const pass = passMap[item.passType];
      if (!pass) {
        return res.status(400).json({
          success: false,
          message: `${item.passType} pass not available`,
        });
      }

      totalAmount += pass.price * item.quantity;
      totalPersons +=
        item.passType === "Couple" ? item.quantity * 2 : item.quantity;
    }

    // Attendee validation
    if (attendees.length !== totalPersons) {
      return res.status(400).json({
        success: false,
        message: `Attendees count mismatch. Expected ${totalPersons}`,
      });
    }

    // Atomic capacity update (safe)
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $expr: {
          $lte: [{ $add: ["$currentBookings", totalPersons] }, "$maxCapacity"],
        },
      },
      { $inc: { currentBookings: totalPersons } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({
        success: false,
        message: "Event sold out during payment",
      });
    }

    // Create booking
    const booking = await Booking.create({
      userId,
      eventId,
      attendees,
      ticketCount: totalPersons,
      items,
      totalAmount: subtotal + taxAmount - discountAmount,
      subtotal,
      discountAmount,
      taxAmount,
      appliedCouponCode,
      orderId: razorpay_order_id,
      status: "confirmed",
    });

    // ⚡ Atomic Usage Increment for Coupon
    if (appliedCouponCode) {
      const Coupon = (await import("../models/Coupon.js")).default;
      await Coupon.findOneAndUpdate(
        { code: appliedCouponCode.toUpperCase() },
        { $inc: { usageCount: 1 } }
      );
    }

    // 🔔 NOTIFICATION: BOOKING CONFIRMED (USER)
    if (userId) {
      broadcastNotification(
        {
          type: "booking_confirmed",
          title: "Booking Confirmed 🎉",
          message: `Your booking for ${event.eventName} is confirmed.`,
          meta: {
            bookingId: booking._id,
            eventId: event._id,
            eventName: event.eventName,
          },
          createdAt: new Date().toISOString(),
        },
        [userId]
      );
    }

    // Generate tickets
    const generatedTickets = [];

    for (const attendee of attendees) {
      const ticketNumber = `TKT-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      const qrData = JSON.stringify({
        ticketNumber,
        bookingId: booking._id,
        eventId,
        attendeeName: attendee.fullName,
        passType: attendee.passType,
      });

      const pass = passMap[attendee.passType];
      const price =
        attendee.passType === "Couple" ? pass.price / 2 : pass.price;

      const ticket = await GeneratedTicket.create({
        bookingId: booking._id,
        eventId,
        userId,
        ticketNumber,
        qrCode: qrData,
        attendee,
        ticketType: attendee.passType,
        price,
      });

      generatedTickets.push(ticket);
    }

    // 🔔 NOTIFICATION: TICKETS GENERATED (USER)
    if (userId) {
      broadcastNotification(
        {
          type: "tickets_generated",
          title: "Tickets Ready 🎫",
          message: `Your tickets for ${event.eventName} are ready.`,
          meta: {
            bookingId: booking._id,
            eventId: event._id,
            eventName: event.eventName,
            ticketCount: generatedTickets.length,
          },
          createdAt: new Date().toISOString(),
        },
        [userId]
      );
    }

    // Save transaction
    await Transaction.create({
      bookingId: booking._id,
      amount: totalAmount,
      providerTxnId: razorpay_order_id,
      status: "completed",
    });

    return res.json({
      success: true,
      message: "Payment verified. Tickets generated.",
      bookingId: booking._id,
      tickets: generatedTickets,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};
