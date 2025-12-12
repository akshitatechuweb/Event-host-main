// controllers/ticketController.js
import Ticket from "../models/Ticket.js";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import crypto from "crypto";

// Generate unique ticket for a booking
export const generateTicket = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('eventId')
      .populate('userId');

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking not confirmed" 
      });
    }

    // Check if ticket already exists
    const existingTicket = await Ticket.findOne({ bookingId });
    if (existingTicket) {
      return res.json({
        success: true,
        message: "Ticket already generated",
        ticket: existingTicket
      });
    }

    // Generate unique ticket number
    const ticketNumber = `TKT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Generate QR code data
    const qrData = JSON.stringify({
      ticketNumber,
      bookingId: booking._id,
      eventId: booking.eventId._id,
      attendeeName: booking.attendee.fullName,
      ticketCount: booking.ticketCount
    });

    // Create ticket
    const ticket = await Ticket.create({
      bookingId: booking._id,
      eventId: booking.eventId._id,
      userId: booking.userId?._id,
      ticketNumber,
      qrCode: qrData,
      attendee: booking.attendee,
      ticketCount: booking.ticketCount,
      totalAmount: booking.totalAmount,
      status: "active"
    });

    res.json({
      success: true,
      message: "Ticket generated successfully",
      ticket: {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        eventName: booking.eventId.eventName,
        eventDate: booking.eventId.eventDate,
        attendee: ticket.attendee,
        ticketCount: ticket.ticketCount,
        qrCode: ticket.qrCode,
        status: ticket.status
      }
    });

  } catch (error) {
    console.error("Generate Ticket Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate ticket" 
    });
  }
};


// Get ticket by booking ID or ticket number
export const getTicket = async (req, res) => {
  try {
    const { bookingId, ticketNumber } = req.query;

    let ticket;
    if (bookingId) {
      ticket = await Ticket.findOne({ bookingId })
        .populate('eventId')
        .populate('bookingId');
    } else if (ticketNumber) {
      ticket = await Ticket.findOne({ ticketNumber })
        .populate('eventId')
        .populate('bookingId');
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Provide bookingId or ticketNumber" 
      });
    }

    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: "Ticket not found" 
      });
    }

    res.json({
      success: true,
      ticket
    });

  } catch (error) {
    console.error("Get Ticket Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch ticket" 
    });
  }
};


// Get all tickets for logged-in user
export const getUserTickets = async (req, res) => {
  try {
    const userId = req.user._id;

    const tickets = await Ticket.find({ userId })
      .populate('eventId')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      tickets
    });

  } catch (error) {
    console.error("Get User Tickets Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch tickets" 
    });
  }
};