// controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Book Now → Create Order
export const createOrder = async (req, res) => {
  try {
    const { 
      eventId, 
      ticketCount = 1,
      fullName,
      email,
      phone,
      gender
    } = req.body;

    const userId = req.user?._id || null;

    // Validate attendee fields
    if (!fullName || !email || !phone || !gender) {
      return res.status(400).json({ 
        success: false, 
        message: "Full Name, Email, Phone, and Gender are required" 
      });
    }

    // Check event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (event.availableSeats < ticketCount) return res.status(400).json({ success: false, message: "Sold Out" });

    // Amount in paise
    const amount = event.entryFees * ticketCount * 100;

    // Create Razorpay order
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
      totalAmount: event.entryFees * ticketCount,
      ticketCount,
    });

  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// Update your verifyPayment to auto-generate ticket
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      ticketCount = 1,
      fullName,
      email,
      phone,
      gender
    } = req.body;

    const userId = req.user?._id || null;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment" });
    }

    const event = await Event.findById(eventId);
    if (!event || event.availableSeats < ticketCount) {
      return res.status(400).json({ success: false, message: "Event sold out" });
    }

    // Reduce seats
    event.availableSeats -= ticketCount;
    await event.save();

    // Save booking with attendee info
    const booking = await Booking.create({
      userId,
      eventId,
      attendee: {
        fullName,
        email,
        phone,
        gender
      },
      ticketCount,
      totalAmount: event.entryFees * ticketCount,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "confirmed",
    });

    // Auto-generate ticket
    const ticketNumber = `TKT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const qrData = JSON.stringify({
      ticketNumber,
      bookingId: booking._id,
      eventId: event._id,
      attendeeName: fullName,
      ticketCount
    });

    const ticket = await Ticket.create({
      bookingId: booking._id,
      eventId: event._id,
      userId,
      ticketNumber,
      qrCode: qrData,
      attendee: {
        fullName,
        email,
        phone,
        gender
      },
      ticketCount,
      totalAmount: event.entryFees * ticketCount,
      status: "active"
    });

    res.json({
      success: true,
      message: "Payment Successful! Ticket Generated",
      booking: {
        id: booking._id,
        eventName: event.eventName,
        totalAmount: event.entryFees * ticketCount,
      },
      ticket: {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        qrCode: ticket.qrCode
      }
    });

  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: "Payment failed" });
  }
};