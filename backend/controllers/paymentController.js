import Razorpay from "razorpay";
import crypto from "crypto";
import axios from "axios";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import GeneratedTicket from "../models/GeneratedTicket.js";
import Transaction from "../models/Transaction.js";
import Coupon from "../models/Coupon.js";
import { broadcastNotification } from "./sseController.js";

// PhonePe Credentials
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
const PHONEPE_API_URL = process.env.PHONEPE_API_URL;
const PHONEPE_STATUS_URL = process.env.PHONEPE_STATUS_URL;

// Razorpay instance (keeping for backward compatibility or if needed)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =====================================================
   HELPER: COMPLETE BOOKING (REUSABLE)
===================================================== */
const processConfirmedBooking = async (transactionId, providerTxnId) => {
  const booking = await Booking.findOne({
    orderId: transactionId,
    status: "pending",
  });
  if (!booking) return null;

  const event = await Event.findById(booking.eventId);
  if (!event) return null;

  // Update capacity (Atomic)
  await Event.findByIdAndUpdate(booking.eventId, {
    $inc: { currentBookings: booking.ticketCount },
  });

  booking.status = "confirmed";
  booking.paymentId = providerTxnId;
  await booking.save();

  // Transaction log
  await Transaction.create({
    bookingId: booking._id,
    amount: booking.totalAmount,
    providerTxnId: providerTxnId,
    status: "completed",
  });

  // Generate Tickets
  const generatedTickets = [];
  const passMap = {};
  event.passes.forEach((p) => {
    passMap[p.type] = p;
  });

  for (const attendee of booking.attendees) {
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const qrData = JSON.stringify({
      ticketNumber,
      bookingId: booking._id,
      eventId: event._id,
      attendeeName: attendee.fullName,
    });
    const pass = passMap[attendee.passType];

    const ticket = await GeneratedTicket.create({
      bookingId: booking._id,
      eventId: event._id,
      userId: booking.userId,
      ticketNumber,
      qrCode: qrData,
      attendee,
      ticketType: attendee.passType,
      price: attendee.passType === "Couple" ? pass.price / 2 : pass.price,
    });
    generatedTickets.push(ticket);
  }

  // Notifications
  if (booking.userId) {
    broadcastNotification(
      {
        type: "booking_confirmed",
        title: "Booking Confirmed 🎉",
        message: `Your booking for ${event.eventName} is confirmed.`,
        meta: { bookingId: booking._id },
        createdAt: new Date().toISOString(),
      },
      [booking.userId],
    );
  }
  return { booking, generatedTickets };
};

/* =====================================================
   CREATE ORDER
===================================================== */
export const createOrder = async (req, res) => {
  try {
    const { eventId, items = [], attendees = [] } = req.body;
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

    let subtotal = 0;
    let totalPersons = 0;

    for (const item of items) {
      const pass = passMap[item.passType];
      if (!pass || pass.price !== item.price) {
        return res.status(400).json({
          success: false,
          message: `Price mismatch or ${item.passType} pass not available`,
        });
      }
      subtotal += pass.price * item.quantity;
      totalPersons +=
        item.passType === "Couple" ? item.quantity * 2 : item.quantity;
    }

    const taxAmount = Math.round(subtotal * 0.1); // 10% tax on original subtotal
    const finalAmount = subtotal + taxAmount;

    // Create a unique temporary order/booking ID
    const internalOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const booking = await Booking.create({
      userId,
      eventId,
      attendees,
      ticketCount: totalPersons,
      items,
      subtotal,
      discountAmount: 0,
      taxAmount,
      totalAmount: finalAmount,
      appliedCouponCode: null,
      orderId: internalOrderId,
      status: "pending",
    });

    return res.json({
      success: true,
      bookingId: booking._id,
      orderId: internalOrderId,
      amount: finalAmount,
      subtotal,
      taxAmount,
      eventName: event.eventName,
      ticketCount: totalPersons,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 2️⃣ Apply Coupon API
 * POST /api/payment/apply-coupon
 */
export const applyCouponToOrder = async (req, res) => {
  try {
    const { bookingId, couponCode } = req.body;
    if (!bookingId || !couponCode) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and coupon code are required",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Coupon can only be applied to pending orders",
      });
    }

    const normalizedCode = couponCode.trim().toUpperCase();

    // Idempotency: If same coupon already applied
    if (booking.appliedCouponCode === normalizedCode) {
      return res.json({
        success: true,
        message: "Coupon already applied",
        amount: booking.totalAmount,
        discountAmount: booking.discountAmount,
        couponCode: normalizedCode,
      });
    }

    // Check if already has a different coupon
    if (booking.appliedCouponCode) {
      return res.status(400).json({
        success: false,
        message:
          "An order can only have one coupon. Remove the current one first.",
      });
    }

    const coupon = await Coupon.findOne({
      code: normalizedCode,
      is_active: true,
    });
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid or inactive coupon" });
    }

    // Validate Expiry and Usage
    const isEligible =
      (!coupon.expiry_date || new Date() <= coupon.expiry_date) &&
      (coupon.usage_limit === null || coupon.usageCount < coupon.usage_limit);

    if (!isEligible) {
      return res.status(400).json({
        success: false,
        message: "Coupon expired or reached usage limit",
      });
    }

    if (booking.subtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Coupons cannot be applied to free events",
      });
    }

    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = (booking.subtotal * coupon.value) / 100;
    } else {
      discountAmount = coupon.value;
    }

    if (discountAmount > booking.subtotal) discountAmount = booking.subtotal;

    const newSubtotalAfterDiscount = booking.subtotal - discountAmount;
    const newTax = Math.round(newSubtotalAfterDiscount * 0.1);
    const newFinalAmount = newSubtotalAfterDiscount + newTax;

    booking.discountAmount = discountAmount;
    booking.taxAmount = newTax;
    booking.totalAmount = newFinalAmount;
    booking.appliedCouponCode = normalizedCode;
    await booking.save();

    return res.json({
      success: true,
      message: "Coupon applied successfully",
      amount: newFinalAmount,
      discountAmount,
      taxAmount: newTax,
      couponCode: normalizedCode,
    });
  } catch (error) {
    console.error("APPLY COUPON ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Optional: Remove Coupon API
 * POST /api/payment/remove-coupon
 */
export const removeCouponFromOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    if (!booking.appliedCouponCode) {
      return res
        .status(400)
        .json({ success: false, message: "No coupon applied to this order" });
    }

    // Restore original values
    const originalTax = Math.round(booking.subtotal * 0.1);
    const originalFinal = booking.subtotal + originalTax;

    booking.discountAmount = 0;
    booking.taxAmount = originalTax;
    booking.totalAmount = originalFinal;
    booking.appliedCouponCode = null;
    await booking.save();

    return res.json({
      success: true,
      message: "Coupon removed",
      amount: originalFinal,
      taxAmount: originalTax,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 3️⃣ Initiate Payment API (For Razorpay)
 * POST /api/payment/initiate-razorpay
 */
export const initiateRazorpayPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    // Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: booking.totalAmount * 100,
      currency: "INR",
      receipt: `booking_${booking._id}`,
    });

    // Update booking with the actual provider order ID
    booking.orderId = razorpayOrder.id;
    await booking.save();

    return res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: booking.totalAmount,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("INITIATE RAZORPAY ERROR:", error);
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
      appliedCouponCode,
    } = req.body;

    // Securely parse financial values from body or default to 0
    const subtotal = Number(req.body.subtotal) || 0;
    const discountAmount = Number(req.body.discountAmount) || 0;
    const taxAmount = Number(req.body.taxAmount) || 0;

    // Calculate totalAmount securely
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Critical check: If totalAmount is NaN or Infinity, stop here
    if (!Number.isFinite(totalAmount)) {
      console.error("VERIFY PAYMENT ERROR: Invalid totalAmount", {
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
      });
      return res.status(400).json({
        success: false,
        message: "Invalid payment calculation: NaN detected",
      });
    }

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
    for (const item of items) {
      const pass = passMap[item.passType];
      if (!pass) {
        return res.status(400).json({
          success: false,
          message: `${item.passType} pass not available`,
        });
      }
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
      { new: true },
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
      totalAmount, // Use verified value
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
        { $inc: { usageCount: 1 } },
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
        [userId],
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
        [userId],
      );
    }

    // Save transaction
    await Transaction.create({
      bookingId: booking._id,
      amount: totalAmount, // Use pre-verified totalAmount
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

/* =====================================================
   PHONEPE: INITIATE PAYMENT
===================================================== */
export const initiatePhonePePayment = async (req, res) => {
  try {
    const { bookingId, eventId, items = [], attendees = [] } = req.body;
    const userId = req.user?._id || null;

    let booking;
    if (bookingId) {
      booking = await Booking.findById(bookingId);
      if (!booking)
        return res
          .status(404)
          .json({ success: false, message: "Booking not found" });
    } else {
      // Emergency fallback: Create booking if not already created (though flow suggests it should be)
      if (!Array.isArray(items) || items.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "items must be a non-empty array" });
      }

      const event = await Event.findById(eventId);
      if (!event)
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });

      const passMap = {};
      event.passes.forEach((p) => {
        passMap[p.type] = p;
      });

      let subtotal = 0;
      let totalPersons = 0;

      for (const item of items) {
        const pass = passMap[item.passType];
        if (!pass || pass.price !== item.price) {
          return res
            .status(400)
            .json({ success: false, message: "Ticket price mismatch" });
        }
        subtotal += pass.price * item.quantity;
        totalPersons +=
          item.passType === "Couple" ? item.quantity * 2 : item.quantity;
      }

      const taxAmount = Math.round(subtotal * 0.1);
      const finalAmount = subtotal + taxAmount;
      const merchantTransactionId = `MT${Date.now()}${Math.floor(Math.random() * 1000)}`;

      booking = await Booking.create({
        userId,
        eventId,
        attendees,
        ticketCount: totalPersons,
        items,
        totalAmount: finalAmount,
        subtotal,
        discountAmount: 0,
        taxAmount,
        appliedCouponCode: null,
        orderId: merchantTransactionId,
        status: "pending",
      });
    }

    const merchantTransactionId = booking.orderId;
    const finalAmount = booking.totalAmount;

    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.get("host");
    const backendBaseUrl = `${protocol}://${host}`;

    // Dynamically find frontend URL
    const origin = req.get("origin");
    const referer = req.get("referer");
    let frontendUrl = origin;
    if (!frontendUrl && referer) {
      try {
        const url = new URL(referer);
        frontendUrl = `${url.protocol}//${url.host}`;
      } catch (e) {
        /* ignore */
      }
    }
    if (!frontendUrl) frontendUrl = "http://localhost:3000";

    // Update booking redirectUrl if needed
    if (frontendUrl && !booking.redirectUrl) {
      booking.redirectUrl = frontendUrl;
      await booking.save();
    }

    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: userId ? userId.toString() : "GUEST",
      amount: finalAmount * 100, // PhonePe takes amount in paise
      redirectUrl: `${backendBaseUrl}/api/payment/phonepe/handle-redirect`,
      redirectMode: "POST",
      callbackUrl: `${backendBaseUrl}/api/payment/phonepe/callback`,
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      "base64",
    );
    const fullURL = base64Payload + "/pg/v1/pay" + SALT_KEY;
    const checksum =
      crypto.createHash("sha256").update(fullURL).digest("hex") +
      "###" +
      SALT_INDEX;

    // 4. Call PhonePe API
    const response = await axios.post(
      PHONEPE_API_URL,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          accept: "application/json",
        },
      },
    );

    if (response.data.success) {
      return res.json({
        success: true,
        paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
        transactionId: merchantTransactionId,
      });
    } else {
      throw new Error(response.data.message || "PhonePe initiation failed");
    }
  } catch (error) {
    console.error(
      "PHONEPE INITIATE ERROR:",
      error.response?.data || error.message,
    );
    return res
      .status(500)
      .json({ success: false, message: "Payment initiation failed" });
  }
};

/* =====================================================
   PHONEPE: CHECK STATUS & COMPLETE BOOKING
===================================================== */
export const checkPhonePeStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // 1. Verify with PhonePe
    const fullURL = `/pg/v1/status/${MERCHANT_ID}/${transactionId}${SALT_KEY}`;
    const checksum =
      crypto.createHash("sha256").update(fullURL).digest("hex") +
      "###" +
      SALT_INDEX;

    const response = await axios.get(
      `${PHONEPE_STATUS_URL}/${MERCHANT_ID}/${transactionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": MERCHANT_ID,
        },
      },
    );

    if (response.data.success && response.data.code === "PAYMENT_SUCCESS") {
      const result = await processConfirmedBooking(
        transactionId,
        response.data.data.transactionId,
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or already processed",
        });
      }

      return res.json({
        success: true,
        message: "Payment successful",
        bookingId: result.booking._id,
        tickets: result.generatedTickets,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment failed or pending",
        code: response.data.code,
      });
    }
  } catch (error) {
    console.error(
      "PHONEPE STATUS ERROR:",
      error.response?.data || error.message,
    );
    return res
      .status(500)
      .json({ success: false, message: "Error checking payment status" });
  }
};

/* =====================================================
   PHONEPE: SERVER-TO-SERVER CALLBACK (WEBHOOK)
===================================================== */
export const phonePeCallback = async (req, res) => {
  try {
    const { response } = req.body;
    if (!response) {
      console.warn("[PHONEPE] Received callback with no payload");
      return res.status(400).send("No response payload");
    }

    const decoded = JSON.parse(
      Buffer.from(response, "base64").toString("utf-8"),
    );
    console.log("[DEBUG] PhonePe Callback Decoded:", decoded);

    if (decoded.success && decoded.code === "PAYMENT_SUCCESS") {
      const transactionId = decoded.data.merchantTransactionId;
      const providerTxnId = decoded.data.transactionId;

      await processConfirmedBooking(transactionId, providerTxnId);
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("PHONEPE CALLBACK ERROR:", error.message);
    return res.status(500).send("Error processing callback");
  }
};

/* =====================================================
   PHONEPE: HANDLE REDIRECT (FROM PHONEPE TO BACKEND)
===================================================== */
export const handlePhonePeRedirect = async (req, res) => {
  try {
    const { merchantTransactionId, transactionId, code } = {
      ...req.query,
      ...req.body,
    };

    console.log("[DEBUG] PhonePe Redirect Received:", {
      merchantTransactionId,
      transactionId,
      code,
    });

    // 1. Fetch the booking to get the original redirectUrl
    const booking = await Booking.findOne({ orderId: merchantTransactionId });
    const frontendUrl =
      booking?.redirectUrl ||
      process.env.FRONTEND_URL ||
      "http://localhost:3000";

    // 2. If code is already SUCCESS, we can try to process it
    if (code === "PAYMENT_SUCCESS") {
      await processConfirmedBooking(merchantTransactionId, transactionId);
      return res.redirect(
        `${frontendUrl}/payment-status?id=${merchantTransactionId}&status=success`,
      );
    }

    // 2. To be extra safe, always check the Status API
    const fullURL = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}${SALT_KEY}`;
    const checksum =
      crypto.createHash("sha256").update(fullURL).digest("hex") +
      "###" +
      SALT_INDEX;

    try {
      const response = await axios.get(
        `${PHONEPE_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            "X-MERCHANT-ID": MERCHANT_ID,
          },
        },
      );

      if (response.data.success && response.data.code === "PAYMENT_SUCCESS") {
        await processConfirmedBooking(
          merchantTransactionId,
          response.data.data.transactionId,
        );
        return res.redirect(
          `${frontendUrl}/payment-status?id=${merchantTransactionId}&status=success`,
        );
      } else {
        return res.redirect(
          `${frontendUrl}/payment-status?id=${merchantTransactionId || "unknown"}&status=failed&code=${response.data.code || code || "ERROR"}`,
        );
      }
    } catch (apiError) {
      console.error("Status check failed in redirect:", apiError.message);
      // Fallback to the code sent by PhonePe in the redirect
      if (code === "PAYMENT_SUCCESS") {
        return res.redirect(
          `${frontendUrl}/payment-status?id=${merchantTransactionId}&status=success`,
        );
      }
      return res.redirect(
        `${frontendUrl}/payment-status?id=${merchantTransactionId || "unknown"}&status=failed`,
      );
    }
  } catch (error) {
    console.error("PHONEPE REDIRECT HANDLER ERROR:", error.message);
    // Try to find the booking one last time for redirection
    const merchantTransactionId =
      req.query?.merchantTransactionId || req.body?.merchantTransactionId;
    const booking = merchantTransactionId
      ? await Booking.findOne({ orderId: merchantTransactionId })
      : null;
    const frontendUrl =
      booking?.redirectUrl ||
      process.env.FRONTEND_URL ||
      "http://localhost:3000";

    return res.redirect(`${frontendUrl}/payment-status?status=error`);
  }
};
