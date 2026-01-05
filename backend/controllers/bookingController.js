import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import Transaction from "../models/Transaction.js";
import GeneratedTicket from "../models/GeneratedTicket.js";
import { broadcastNotification } from "./sseController.js";

// Create a booking
export const createBooking = async (req, res) => {
  try {
    const {
      eventId,
      selectedTickets = [],
      attendees = [],
      pricePaid,
    } = req.body;

    const userId = req.user?._id || null; // guest allowed

    // Validate selectedTickets & attendees
    if (!Array.isArray(selectedTickets) || selectedTickets.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "selectedTickets must be provided" });
    }

    if (!Array.isArray(attendees) || attendees.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "attendees must be provided" });
    }

    // Check event status
    const event = await Event.findById(eventId);
    if (!event || event.status !== "live") {
      return res
        .status(400)
        .json({ success: false, message: "Event not live or not found" });
    }

    // Build pass map and validate stock
    const passMap = {};
    (event.passes || []).forEach((p) => (passMap[p.type] = p));

    let totalPersonsRequired = 0;
    let totalAmount = 0;
    for (const item of selectedTickets) {
      const pass = passMap[item.type];
      if (!pass)
        return res
          .status(400)
          .json({ success: false, message: `${item.type} pass not available` });
      if (pass.remainingQuantity < item.quantity)
        return res
          .status(400)
          .json({
            success: false,
            message: `${item.type} pass insufficient stock`,
          });
      totalAmount += pass.price * item.quantity;
      totalPersonsRequired +=
        item.type === "Couple" ? item.quantity * 2 : item.quantity;
    }

    if (attendees.length !== totalPersonsRequired) {
      return res
        .status(400)
        .json({
          success: false,
          message: "attendees length does not match selected tickets quantity",
        });
    }

    // capacity check
    if (
      typeof event.maxCapacity === "number" &&
      (event.currentBookings || 0) + totalPersonsRequired > event.maxCapacity
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Event sold out or insufficient capacity",
        });
    }

    // distribution validation
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
        return res
          .status(400)
          .json({
            success: false,
            message: `attendees distribution does not match selected tickets for pass ${ptype}`,
          });
      }
    }

    // Reduce stock now for mock booking
    for (const item of selectedTickets) {
      const pass = passMap[item.type];
      pass.remainingQuantity -= item.quantity;
    }
    await event.save();
    event.currentBookings = (event.currentBookings || 0) + attendees.length;
    await event.save();

    const booking = await Booking.create({
      eventId,
      userId,
      attendees,
      items: selectedTickets,
      totalAmount: pricePaid || totalAmount,
      orderId: "test_order_" + Math.random().toString(36).substring(2, 10),
      ticketCount: attendees.length,
      status: "pending",
    });

    // Generate per-person GeneratedTicket for each attendee
    const generatedTickets = [];
    for (const att of attendees) {
      const ticketNumber =
        "TKT-" +
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2, 10).toUpperCase();
      const qrData = JSON.stringify({
        ticketNumber,
        bookingId: booking._id,
        eventId,
        attendeeName: att.fullName,
        ticketType: att.passType,
      });
      const pass = passMap[att.passType];
      const price = pass
        ? pass.type === "Couple"
          ? pass.price / 2
          : pass.price
        : 0;
      const newTicket = await GeneratedTicket.create({
        bookingId: booking._id,
        eventId,
        userId,
        ticketNumber,
        qrCode: qrData,
        attendee: att,
        ticketType: att.passType,
        price,
      });
      generatedTickets.push(newTicket);
    }

    // Mock payment transaction
    const transaction = await Transaction.create({
      bookingId: booking._id,
      amount: pricePaid,
      platformFee: pricePaid * 0.1,
      payoutToHost: pricePaid * 0.9,
      providerTxnId: "mock_" + Math.random().toString(36).substring(2, 10),
      status: "completed",
    });

    // Mark booking as confirmed after mock payment
    booking.status = "confirmed";
    await booking.save();

    broadcastNotification(
      {
        type: "booking_confirmed",
        title: "Booking Confirmed 🎉",
        message: `Your booking for "${event.eventName}" is confirmed.`,
        meta: {
          bookingId: booking._id,
          eventId,
          tickets: attendees.length,
          amount: booking.totalAmount,
        },
        createdAt: new Date().toISOString(),
      },
      [userId]
    );

    res.status(201).json({
      success: true,
      message: "Booking successful",
      booking,
      tickets: generatedTickets,
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
    // attach generated tickets
    const bookingIds = bookings.map((b) => b._id);
    const tickets = await GeneratedTicket.find({
      bookingId: { $in: bookingIds },
    });
    const ticketsByBooking = tickets.reduce((acc, t) => {
      acc[t.bookingId] = acc[t.bookingId] || [];
      acc[t.bookingId].push(t);
      return acc;
    }, {});

    const enriched = bookings.map((b) => ({
      ...b.toObject(),
      generatedTickets: ticketsByBooking[b._id] || [],
    }));

    res.json({ success: true, bookings: enriched });
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
    // attach generated tickets
    const bookingIds = bookings.map((b) => b._id);
    const tickets = await GeneratedTicket.find({
      bookingId: { $in: bookingIds },
    });
    const ticketsByBooking = tickets.reduce((acc, t) => {
      acc[t.bookingId] = acc[t.bookingId] || [];
      acc[t.bookingId].push(t);
      return acc;
    }, {});

    const enriched = bookings.map((b) => ({
      ...b.toObject(),
      generatedTickets: ticketsByBooking[b._id] || [],
    }));

    res.json({ success: true, bookings: enriched });
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
    const bookings = await Booking.find({})
      .select("_id status totalAmount createdAt")
      .lean();

    return res.status(200).json({
      success: true,
      bookings: bookings || [],
    });
  } catch (err) {
    console.error("❌ Admin bookings failed:", err);

    // 🔑 Never fail dashboard
    return res.status(200).json({
      success: true,
      bookings: [],
    });
  }
};
