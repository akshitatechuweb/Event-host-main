// controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
export const createOrder = async (req, res) => {
  try {
    const { eventId, ticketCount = 1, bookingName, bookingEmail, bookingPhone } = req.body;
    const userId = req.user?._id || null;

    // Auto-fill from logged-in user if fields are not provided
    let finalName = bookingName?.trim();
    let finalEmail = bookingEmail?.trim();
    let finalPhone = bookingPhone?.trim();

    if (req.user) {
      finalName = finalName || req.user.name?.trim();
      finalEmail = finalEmail || req.user.email?.trim();
      finalPhone = finalPhone || req.user.phone?.trim();
    }

    // Validation: All three are required (either from body or profile)
    if (!finalName || !finalEmail || !finalPhone) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, and Phone are required",
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.availableSeats < ticketCount) {
      return res.status(400).json({ success: false, message: "Not enough seats available" });
    }

    const amount = event.entryFees * ticketCount * 100; // in paise

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
    });

    res.json({
      success: true,
      orderId: order.id,
      amount,
      key_id: process.env.RAZORPAY_KEY_ID,
      eventName: event.eventName,
      totalAmount: event.entryFees * ticketCount,
      ticketCount,
      bookingName: finalName,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      ticketCount = 1,
      bookingName,
      bookingEmail,
      bookingPhone,
    } = req.body;

    const userId = req.user?._id || null;

    // Auto-fill same as createOrder
    let finalName = bookingName?.trim();
    let finalEmail = bookingEmail?.trim();
    let finalPhone = bookingPhone?.trim();

    if (req.user) {
      finalName = finalName || req.user.name?.trim();
      finalEmail = finalEmail || req.user.email?.trim();
      finalPhone = finalPhone || req.user.phone?.trim();
    }

    if (!finalName || !finalEmail || !finalPhone) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, and Phone are required",
      });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const event = await Event.findById(eventId);
    if (!event || event.availableSeats < ticketCount) {
      return res.status(400).json({ success: false, message: "Event sold out or not found" });
    }

    // Deduct seats
    event.availableSeats -= ticketCount;
    await event.save();

    // Create booking
    const booking = await Booking.create({
      userId,
      eventId,
      bookingName: finalName,
      bookingEmail: finalEmail,
      bookingPhone: finalPhone,
      ticketCount,
      totalAmount: event.entryFees * ticketCount,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "confirmed",
    });

    res.json({
      success: true,
      message: "Payment Successful! Ticket Booked",
      booking: {
        id: booking._id,
        eventName: event.eventName,
        bookingName: finalName,
        ticketCount,
        totalAmount: event.entryFees * ticketCount,
      },
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};