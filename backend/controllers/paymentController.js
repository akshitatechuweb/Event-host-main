// controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import QRCode from "qrcode";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Book Now → Create Order
export const createBookingOrder = async (req, res) => {
  try {
    const { eventId, ticketCount = 1, bookingName, bookingEmail, bookingPhone } = req.body;
    const userId = req.user?._id || null;

    // Validation
    if (!bookingName || !bookingEmail || !bookingPhone) {
      return res.status(400).json({ success: false, message: "Name, Email, Phone required" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (event.availableSeats < ticketCount) return res.status(400).json({ success: false, message: "Sold Out" });

    const totalAmount = event.entryFees * ticketCount * 100; 

    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: totalAmount,
      key_id: process.env.RAZORPAY_KEY_ID,
      eventName: event.eventName,
      entryFees: event.entryFees,
      ticketCount,
      totalAmount: event.entryFees * ticketCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Payment Success → Confirm Booking + Generate QR
export const verifyBookingPayment = async (req, res) => {
  try {
    const {
      order_id,
      payment_id,
      signature,
      eventId,
      ticketCount,
      bookingName,
      bookingEmail,
      bookingPhone,
    } = req.body;

    const userId = req.user?._id || null;

    // Verify signature
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");

    if (expectedSign !== signature) {
      return res.status(400).json({ success: false, message: "Invalid payment" });
    }

    const event = await Event.findById(eventId);
    if (!event || event.availableSeats < ticketCount) {
      return res.status(400).json({ success: false, message: "Event sold out" });
    }

    // Reduce seats
    event.availableSeats -= ticketCount;
    await event.save();

    // Generate QR Code
    const qrData = `https://unrealvibe.com/ticket/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const qrCode = await QRCode.toDataURL(qrData);

    // Save Booking
    const booking = await Booking.create({
      userId,
      eventId,
      bookingName,
      bookingEmail,
      bookingPhone,
      ticketCount,
      totalAmount: event.entryFees * ticketCount,
      orderId: order_id,
      paymentId: payment_id,
      paymentStatus: "success",
      qrCode,
    });

    await booking.populate("eventId", "eventName date time fullAddress eventImage");

    res.json({
      success: true,
      message: "Booking Confirmed! Your ticket is ready",
      booking: {
        id: booking._id,
        eventName: booking.eventId.eventName,
        date: booking.eventId.date,
        bookingName,
        ticketCount,
        qrCode,
        ticketUrl: qrData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Payment failed" });
  }
};