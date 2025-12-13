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
// VERIFY PAYMENT (ORDER-ID ONLY)
// ===============================
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,   // ONLY REQUIRED PAYMENT FIELD
      eventId,
      attendees = [],
      selectedTickets = [],
    } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "razorpay_order_id is required",
      });
    }

    const userId = req.user?._id || null;

    // ======================================================
    // 1. Fetch Event
    // ======================================================
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!Array.isArray(selectedTickets) || selectedTickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "selectedTickets must be a non-empty array",
      });
    }

    // ======================================================
    // 2. Build Pass Map
    // ======================================================
    const passMap = {};
    (event.passes || []).forEach((p) => {
      passMap[p.type] = p;
    });

    let totalPersons = 0;
    let totalAmount = 0;

    // ======================================================
    // 3. Validate Tickets & Stock
    // ======================================================
    for (const item of selectedTickets) {
      const pass = passMap[item.type];
      if (!pass) {
        return res.status(400).json({
          success: false,
          message: `${item.type} pass not available`,
        });
      }

      if (pass.remainingQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${item.type} pass insufficient stock`,
        });
      }

      totalAmount += pass.price * item.quantity;
      totalPersons += item.type === "Couple"
        ? item.quantity * 2
        : item.quantity;
    }

    // ======================================================
    // 4. Validate Attendees Count
    // ======================================================
    if (!Array.isArray(attendees) || attendees.length !== totalPersons) {
      return res.status(400).json({
        success: false,
        message: `Attendees count mismatch. Expected ${totalPersons}, got ${attendees.length}`,
      });
    }

    // ======================================================
    // 5. Validate Attendee Distribution
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

    for (const [type, count] of Object.entries(expectedCounts)) {
      if ((actualCounts[type] || 0) !== count) {
        return res.status(400).json({
          success: false,
          message: `Attendee distribution mismatch for pass ${type}`,
        });
      }
    }

    // ======================================================
    // 6. Reduce Stock + Update Event
    // ======================================================
    for (const item of selectedTickets) {
      passMap[item.type].remainingQuantity -= item.quantity;
    }

    event.currentBookings =
      (event.currentBookings || 0) + attendees.length;

    await event.save();

    // ======================================================
    // 7. Create Booking (NO paymentId / signature)
    // ======================================================
    const booking = await Booking.create({
      userId,
      eventId,
      attendees,
      ticketCount: attendees.length,
      items: selectedTickets.map((i) => ({
        passType: i.type,
        quantity: i.quantity,
        price: passMap[i.type].price,
      })),
      totalAmount,
      orderId: razorpay_order_id,
      status: "confirmed",
    });

    // ======================================================
    // 8. Generate Tickets
    // ======================================================
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
        attendee.passType === "Couple"
          ? pass.price / 2
          : pass.price;

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

    // ======================================================
    // 9. Save Transaction (MOCK)
    // ======================================================
    await Transaction.create({
      bookingId: booking._id,
      amount: totalAmount,
      providerTxnId: razorpay_order_id,
      status: "completed",
    });

    // ======================================================
    // 10. Success Response
    // ======================================================
    return res.json({
      success: true,
      message: "Order verified successfully. Tickets generated.",
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