// controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import GeneratedTicket from "../models/GeneratedTicket.js";
import Transaction from "../models/Transaction.js";

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ===============================
// CREATE ORDER
// ===============================
export const createOrder = async (req, res) => {
  try {
    const { eventId, selectedTickets = [], attendees = [] } = req.body;
    const userId = req.user?._id || null;

    // Validate attendees
    if (Array.isArray(attendees) && attendees.length > 0) {
      for (const a of attendees) {
        if (!a.fullName || !a.email || !a.phone || !a.gender || !a.passType) {
          return res.status(400).json({
            success: false,
            message:
              "Each attendee must have fullName, email, phone, gender & passType",
          });
        }
      }
    }

    // Fetch event
    const event = await Event.findById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    if (!Array.isArray(selectedTickets) || selectedTickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "selectedTickets must be a non-empty array",
      });
    }

    // Build pass map
    const passMap = {};
    (event.passes || []).forEach((p) => (passMap[p.type] = p));

    let totalAmount = 0;
    let totalPersons = 0;

    for (const item of selectedTickets) {
      const pass = passMap[item.type];
      if (!pass)
        return res
          .status(400)
          .json({ success: false, message: `${item.type} pass not available` });

      if (pass.remainingQuantity < item.quantity)
        return res.status(400).json({
          success: false,
          message: `${item.type} pass insufficient stock`,
        });

      totalAmount += pass.price * item.quantity;
      totalPersons +=
        item.type === "Couple" ? item.quantity * 2 : item.quantity;
    }

    if (
      Array.isArray(attendees) &&
      attendees.length > 0 &&
      attendees.length !== totalPersons
    ) {
      return res.status(400).json({
        success: false,
        message: "attendees length must match selected tickets person count",
      });
    }

    // Capacity check against maxCapacity
    if (
      typeof event.maxCapacity === "number" &&
      (event.currentBookings || 0) + totalPersons > event.maxCapacity
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Event sold out or insufficient capacity",
        });
    }

    const amount = Math.round(totalAmount * 100);

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount,
      key_id: process.env.RAZORPAY_KEY_ID,
      eventName: event.eventName,
      totalAmount,
      ticketCount: totalPersons,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// VERIFY PAYMENT + AUTO GENERATE TICKET
// ===============================
export const verifyPayment = async (req, res) => {
  try {
    console.log("Verify Payment Body:", req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      attendees = [],
      selectedTickets = [],
    } = req.body;

    const userId = req.user?._id || null;

    // ======================================================
    // 1. BYPASS SIGNATURE VERIFICATION FOR TESTING
    // ======================================================
    // ❗ IMPORTANT: Keep this disabled while testing in Postman
    // Remove this comment only for PRODUCTION.
    /*
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment" });
    }
    */

    // ======================================================
    // 2. Fetch Event
    // ======================================================
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (!Array.isArray(selectedTickets) || selectedTickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "selectedTickets must be a non-empty array",
      });
    }

    // ======================================================
    // 3. Build pass map
    // ======================================================
    const passMap = {};
    (event.passes || []).forEach((p) => (passMap[p.type] = p));

    console.log("Pass Map:", passMap);

    let totalPersons = 0;
    let totalAmount = 0;

    // ======================================================
    // 4. Validate selected tickets
    // ======================================================
    for (const item of selectedTickets) {
      const pass = passMap[item.type];
      if (!pass)
        return res.status(400).json({
          success: false,
          message: `${item.type} pass does not exist for this event`,
        });

      if (pass.remainingQuantity < item.quantity)
        return res.status(400).json({
          success: false,
          message: `${item.type} pass has insufficient stock`,
        });

      totalAmount += pass.price * item.quantity;
      totalPersons +=
        item.type === "Couple" ? item.quantity * 2 : item.quantity;
    }

    // ======================================================
    // 5. Validate attendees count
    // ======================================================
    if (!Array.isArray(attendees) || attendees.length !== totalPersons) {
      return res.status(400).json({
        success: false,
        message: `Attendees count mismatch. Expected ${totalPersons}, got ${attendees.length}`,
      });
    }

    // ======================================================
    // 6. Validate distribution (Male / Female / Couple etc.)
    // ======================================================
    const expectedCounts = {};
    selectedTickets.forEach((item) => {
      expectedCounts[item.type] =
        (expectedCounts[item.type] || 0) +
        (item.type === "Couple" ? item.quantity * 2 : item.quantity);
    });

    const actualCounts = {};
    attendees.forEach((a) => {
      actualCounts[a.passType] = (actualCounts[a.passType] || 0) + 1;
    });

    for (const [ptype, expected] of Object.entries(expectedCounts)) {
      if ((actualCounts[ptype] || 0) !== expected) {
        return res.status(400).json({
          success: false,
          message: `Attendee distribution mismatch for pass ${ptype}`,
        });
      }
    }

    // ======================================================
    // 7. Reduce stock & Update event
    // ======================================================
    for (const item of selectedTickets) {
      passMap[item.type].remainingQuantity -= item.quantity;
    }

    event.currentBookings = (event.currentBookings || 0) + attendees.length;

    await event.save();

    // ======================================================
    // 8. Create Booking
    // ======================================================
    // Build booking items
    const bookingItems = selectedTickets.map((item) => ({
      passType: item.type,
      quantity: item.quantity,
      price: passMap[item.type].price,
    }));

    // Save booking
    const booking = await Booking.create({
      userId,
      eventId,
      attendees,
      ticketCount: attendees.length,
      items: bookingItems,
      totalAmount,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "confirmed",
    });

    // ======================================================
    // 9. Generate Tickets
    // ======================================================
    const generatedTickets = [];

    for (const attendee of attendees) {
      const ticketNumber = `TKT-${Date.now()}-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`;

      const qrData = JSON.stringify({
        ticketNumber,
        bookingId: booking._id,
        eventId: event._id,
        attendeeName: attendee.fullName,
        ticketType: attendee.passType,
      });

      const pass = passMap[attendee.passType];
      const price =
        pass && pass.type === "Couple" ? pass.price / 2 : pass?.price || 0;

      const newTicket = await GeneratedTicket.create({
        bookingId: booking._id,
        eventId: event._id,
        userId,
        ticketNumber,
        qrCode: qrData,
        attendee,
        ticketType: attendee.passType,
        price,
      });

      generatedTickets.push(newTicket);
    }

    // ======================================================
    // 10. Final Success Response
    // ======================================================
    return res.json({
      success: true,
      message: "Payment Successful! Tickets Generated",
      booking: {
        id: booking._id,
        eventName: event.eventName,
        totalAmount,
      },
      tickets: generatedTickets,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Payment failed — internal error",
      error: error.message,
    });
  }
};
