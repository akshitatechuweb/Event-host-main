import Booking from "../models/Booking.js";
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import Transaction from "../models/Transaction.js";

//  Create a booking
export const createBooking = async (req, res) => {
  try {
    const { eventId, ticketTypeId, pricePaid } = req.body;
    const userId = req.user._id;

    // Validate ticket type
    const ticket = await Ticket.findById(ticketTypeId);
    if (!ticket || ticket.eventId.toString() !== eventId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ticket type" });
    }

    // Check ticket availability
    if (ticket.availableQuantity <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Tickets sold out" });
    }

    // Check event status
    const event = await Event.findById(eventId);
    if (!event || event.status !== "live") {
      return res
        .status(400)
        .json({ success: false, message: "Event not live or not found" });
    }

    // Create booking
    const booking = await Booking.create({
      eventId,
      userId,
      ticketTypeId,
      pricePaid,
      status: "requested",
    });

    // Decrease available ticket count
    ticket.quantity.available -= 1;
    await ticket.save();

    // Mock transaction (simulate Razorpay success)
    const transaction = await Transaction.create({
      bookingId: booking._id,
      amount: pricePaid,
      platformFee: pricePaid * 0.1, // 10% fee
      payoutToHost: pricePaid * 0.9,
      providerTxnId: "mock_" + Math.random().toString(36).substring(2, 10),
      status: "completed",
    });

    res.status(201).json({
      success: true,
      message: "Booking successful",
      booking,
      transaction,
    });
  } catch (err) {
    console.error("❌ Error creating booking:", err);
    res.status(500).json({ success: false, message: "Error creating booking" });
  }
};

//  Guest: Get my bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("eventId", "title location startDateTime")
      .populate("ticketTypeId", "name price");

    res.json({ success: true, bookings });
  } catch (err) {
    console.error("❌ Error fetching my bookings:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch bookings" });
  }
};

// Host: Get all bookings for their events
export const getHostBookings = async (req, res) => {
  try {
    const events = await Event.find({ hostId: req.user._id }).select("_id");
    const eventIds = events.map((e) => e._id);

    const bookings = await Booking.find({ eventId: { $in: eventIds } })
      .populate("userId", "name phone email")
      .populate("ticketTypeId", "name price");

    res.json({ success: true, bookings });
  } catch (err) {
    console.error("❌ Error fetching host bookings:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch host bookings" });
  }
};

//  Admin: Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("eventId", "title")
      .populate("userId", "name phone email")
      .populate("ticketTypeId", "name price");

    res.json({ success: true, bookings });
  } catch (err) {
    console.error("❌ Error fetching all bookings:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch all bookings" });
  }
};
