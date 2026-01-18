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

/* =====================================================
   HELPER: COMPLETE BOOKING (REUSABLE)
===================================================== */
const processConfirmedBooking = async (
  transactionId,
  providerTxnId,
  amountPaidPaise,
) => {
  const booking = await Booking.findOne({
    orderId: transactionId,
    status: "pending",
  });
  if (!booking) return null;

  // Security: Verify amount paid matches the booking record (converting paise to rupee)
  const amountPaidRupee = amountPaidPaise / 100;
  if (Math.abs(booking.totalAmount - amountPaidRupee) > 0.01) {
    console.error(
      `CRITICAL: Amount mismatch for booking ${booking._id}. Expected ${booking.totalAmount}, got ${amountPaidRupee}`,
    );
    booking.status = "failed";
    await booking.save();
    return null;
  }

  const event = await Event.findById(booking.eventId);
  if (!event) return null;

  // 1. Update capacity (Atomic)
  const updatedEvent = await Event.findOneAndUpdate(
    {
      _id: booking.eventId,
      $expr: {
        $lte: [
          { $add: ["$currentBookings", booking.ticketCount] },
          "$maxCapacity",
        ],
      },
    },
    { $inc: { currentBookings: booking.ticketCount } },
    { new: true },
  );

  if (!updatedEvent) {
    console.error(
      `FAILED TO CONFIRM BOOKING ${booking._id}: Event capacity reached during payment.`,
    );
    booking.status = "failed";
    await booking.save();
    return null;
  }

  // Coupon usage increment removed as usageCount is removed from simplified model

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
      passType: attendee.passType,
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
        meta: { bookingId: booking._id, eventId: event._id },
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

    // Validate Attendees against Schema
    if (!Array.isArray(attendees) || attendees.length === 0) {
      return res.status(400).json({
        success: false,
        message: "attendees must be a non-empty array",
      });
    }

    for (const attendee of attendees) {
      if (
        !attendee.fullName ||
        !attendee.email ||
        !attendee.phone ||
        !attendee.gender ||
        !attendee.passType
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each attendee must have fullName, email, phone, gender, and passType",
        });
      }
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Capacity Check & Pricing Calculation
    let totalPersons = 0;
    const passMap = {};
    event.passes.forEach((p) => {
      passMap[p.type] = p;
    });

    let subtotal = 0;
    const itemsWithPrice = [];
    for (const item of items) {
      const pass = passMap[item.passType];
      if (!pass) {
        return res.status(400).json({
          success: false,
          message: `${item.passType} pass not available`,
        });
      }

      const itemPrice = pass.price;
      subtotal += itemPrice * item.quantity;
      totalPersons +=
        item.passType === "Couple" ? item.quantity * 2 : item.quantity;

      // Store items with their price for the Booking record
      itemsWithPrice.push({
        passType: item.passType,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    if ((event.currentBookings || 0) + totalPersons > event.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: "Event capacity reached",
      });
    }

    const taxAmount = Math.round(subtotal * 0.1);
    const finalAmount = subtotal + taxAmount;

    const internalOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const booking = await Booking.create({
      userId,
      eventId,
      attendees,
      ticketCount: totalPersons,
      items: itemsWithPrice,
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
 * 3️⃣ Initiate Payment API (For PhonePe)
 * POST /api/payment/phonepe/initiate
 */
export const initiatePhonePePayment = async (req, res) => {
  try {
    const { bookingId, couponCode } = req.body;

    if (!bookingId) {
      return res
        .status(400)
        .json({ success: false, message: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Only pending bookings can be paid" });
    }

    // ⚡ Optional Coupon Application Logic during Payment Initiation
    // 1. If couponCode is provided as a non-empty string -> Apply it
    if (typeof couponCode === "string" && couponCode.trim() !== "") {
      const normalizedCode = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: normalizedCode });

      if (!coupon) {
        return res
          .status(404)
          .json({ success: false, message: "Invalid coupon code" });
      }

      if (booking.subtotal <= 0) {
        return res.status(400).json({
          success: false,
          message: "Coupons cannot be applied to free events",
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.type === "PERCENTAGE") {
        discountAmount = (booking.subtotal * coupon.value) / 100;
      } else {
        discountAmount = coupon.value;
      }

      // Cap discount at subtotal
      if (discountAmount > booking.subtotal) discountAmount = booking.subtotal;

      // Update booking with the discount and recalculated total
      const newSubtotalAfterDiscount = booking.subtotal - discountAmount;
      const newTax = Math.round(newSubtotalAfterDiscount * 0.1);
      const newFinalAmount = newSubtotalAfterDiscount + newTax;

      booking.discountAmount = discountAmount;
      booking.taxAmount = newTax;
      booking.totalAmount = newFinalAmount;
      booking.appliedCouponCode = normalizedCode;
      await booking.save();
    }
    // 2. If couponCode is explicitly null or empty string -> Remove existing coupon
    else if (couponCode === null || couponCode === "") {
      const originalTax = Math.round(booking.subtotal * 0.1);
      const originalTotal = booking.subtotal + originalTax;

      booking.discountAmount = 0;
      booking.taxAmount = originalTax;
      booking.totalAmount = originalTotal;
      booking.appliedCouponCode = null;
      await booking.save();
    }
    // 3. If couponCode is undefined (not in body) -> Do nothing, use current booking state

    const merchantTransactionId = booking.orderId;
    const finalAmount = booking.totalAmount;

    // Construct Backend Base URL
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.get("host");
    const backendBaseUrl = `${protocol}://${host}`;

    // Fix: We don't care about frontend URL anymore. 
    // The redirect will always come back to OUR backend status page.
    // CHANGE: Adjusted to match the actual route defined in paymentRoutes.js (handle-redirect)
    const redirectUrl = `${backendBaseUrl}/api/payment/phonepe/handle-redirect`;
    booking.redirectUrl = redirectUrl; // Saving just for reference/debugging
    await booking.save();

    const userId = booking.userId;

    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: userId ? userId.toString() : "GUEST",
      amount: Math.round(finalAmount * 100), // paise
      redirectUrl: redirectUrl,
      redirectMode: "POST", // PhonePe sends a POST to this URL
      callbackUrl: `${backendBaseUrl}/api/payment/phonepe/callback`, // S2S Webhook
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
        amount: finalAmount,
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
   VERIFY PAYMENT (General endpoint for frontend)
   POST /api/payment/verify-payment
===================================================== */
export const verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      return res
        .status(400)
        .json({ success: false, message: "transactionId is required" });
    }

    // 1. Verify with PhonePe Status API
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
        response.data.data.amount, // paise
      );

      if (!result) {
        // If result is null, it might mean the booking is already confirmed 
        // OR it genuinely failed/wasn't found. 
        // Let's check the booking status to be sure.
        const existingBooking = await Booking.findOne({ orderId: transactionId });
        if (existingBooking && existingBooking.status === 'confirmed') {
          return res.json({
            success: true,
            message: "Payment verified successfully (Already Processed)",
            bookingId: existingBooking._id,
            // Note: generatedTickets might not be readily available here if we don't fetch them, 
            // but usually verification is done once. 
            // If needed we can fetch them from GeneratedTicket model.
          });
        }

        return res.status(404).json({
          success: false,
          message: "Booking not found or already processed",
        });
      }

      return res.json({
        success: true,
        message: "Payment verified successfully",
        bookingId: result.booking._id,
        tickets: result.generatedTickets,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed or pending",
        code: response.data.code,
      });
    }
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error verifying payment" });
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
        response.data.data.amount, // paise
      );

      // If already confirmed, retrieve existing data
      if (!result) {
        const existingBooking = await Booking.findOne({ orderId: transactionId });
        if (existingBooking && existingBooking.status === 'confirmed') {
          return res.json({
            success: true,
            message: "Payment successful",
            bookingId: existingBooking._id,
            // Ideally return tickets here too if possible, but basic status is OK
          });
        }
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
      const amount = decoded.data.amount; // paise

      await processConfirmedBooking(transactionId, providerTxnId, amount);
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("PHONEPE CALLBACK ERROR:", error.message);
    return res.status(500).send("Error processing callback");
  }
};

/* =====================================================
   PHONEPE: HANDLE REDIRECT (FROM PHONEPE TO BACKEND)
   This now renders a simple static page.
===================================================== */
export const handlePhonePeRedirect = async (req, res) => {
  try {
    const { merchantTransactionId, code } = {
      ...req.query,
      ...req.body,
    };

    console.log("[DEBUG] PhonePe Redirect Received:", {
      merchantTransactionId,
      code,
    });

    // 1. Always check the Status API to be sure
    const fullURL = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}${SALT_KEY}`;
    const checksum =
      crypto.createHash("sha256").update(fullURL).digest("hex") +
      "###" +
      SALT_INDEX;

    let isSuccess = false;
    let message = "Payment Processing...";

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
          response.data.data.amount, // paise
        );
        isSuccess = true;
        message = "Payment Successful! You can close this window.";
      } else {
        message = `Payment Failed: ${response.data.code || "Unknown Error"}`;
      }
    } catch (apiError) {
      console.error("Status check failed in redirect:", apiError.message);
      message = "We are verifying your payment. Please check your app.";
    }

    // 2. Return a simple HTML page
    // Using a simple style to look decent on mobile
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Status</title>
        <style>
          body { font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f4f4f5; }
          .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center; max-width: 90%; width: 400px; }
          .icon { font-size: 48px; margin-bottom: 1rem; }
          h1 { font-size: 1.5rem; margin: 0 0 0.5rem 0; color: #18181b; }
          p { color: #71717a; margin: 0; }
          .success { color: #10b981; }
          .error { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon ${isSuccess ? 'success' : 'error'}">
            ${isSuccess ? '✅' : '❌'}
          </div>
          <h1>${isSuccess ? 'Payment Successful' : 'Payment Failed'}</h1>
          <p>${message}</p>
          <p style="margin-top: 1rem; font-size: 0.875rem; color: #a1a1aa;">You can close this window now.</p>
        </div>
        <script>
           // Optional: Close window automatically after a few seconds if it was a popup
           // setTimeout(() => window.close(), 5000);
        </script>
      </body>
      </html>
    `;

    return res.status(isSuccess ? 200 : 400).send(html);

  } catch (error) {
    console.error("PHONEPE REDIRECT HANDLER ERROR:", error.message);
    return res.status(500).send("Internal Server Error during payment processing.");
  }
};
