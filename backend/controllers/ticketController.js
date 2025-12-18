import crypto from "crypto";

import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import GeneratedTicket from "../models/GeneratedTicket.js";
import { broadcastNotification } from "./sseController.js";

/* ================= HOST: CREATE TICKET TYPE ================= */

export const createTicket = async (req, res) => {
  try {
    const { eventId, name, price, quantity, refundPolicy } = req.body;
    const hostId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (event.hostId.toString() !== hostId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const finalQuantity =
      typeof quantity === "number"
        ? { total: quantity, available: quantity }
        : quantity;

    const ticket = await Ticket.create({
      eventId,
      name,
      price,
      quantity: finalQuantity,
      refundPolicy,
    });

    // 🔔 NOTIFICATION: TICKET TYPE CREATED
    broadcastNotification(
      {
        type: "ticket_created",
        title: "Ticket Created 🎟️",
        message: `Ticket "${name}" has been created for your event.`,
        meta: {
          eventId,
          ticketId: ticket._id,
          price,
          quantity: finalQuantity.total || quantity,
        },
        createdAt: new Date().toISOString(),
      },
      [hostId]
    );

    res.status(201).json({
      success: true,
      message: "Ticket type created",
      ticket,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create ticket" });
  }
};

/* ================= GET TICKETS BY EVENT ================= */

export const getTicketsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const tickets = await Ticket.find({ eventId });
    const event = await Event.findById(eventId);

    res.json({
      success: true,
      tickets,
      passes: event?.passes || [],
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch tickets" });
  }
};

/* ================= UPDATE TICKET ================= */

export const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("eventId");

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    if (ticket.eventId.hostId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    Object.assign(ticket, req.body);
    await ticket.save();

    // 🔔 NOTIFICATION: TICKET UPDATED
    broadcastNotification(
      {
        type: "ticket_updated",
        title: "Ticket Updated ✏️",
        message: `A ticket for your event has been updated.`,
        meta: {
          ticketId: ticket._id,
          eventId: ticket.eventId._id,
        },
        createdAt: new Date().toISOString(),
      },
      [req.user._id]
    );

    res.json({ success: true, ticket });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update ticket" });
  }
};

/* ================= DELETE TICKET ================= */

export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("eventId");

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    if (
      req.user.role !== "admin" &&
      ticket.eventId.hostId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    // 🔔 NOTIFICATION: TICKET DELETED
    broadcastNotification(
      {
        type: "ticket_deleted",
        title: "Ticket Deleted 🗑️",
        message: "A ticket type has been removed from your event.",
        meta: {
          ticketId: req.params.id,
          eventId: ticket.eventId._id,
        },
        createdAt: new Date().toISOString(),
      },
      [req.user._id]
    );

    res.json({ success: true, message: "Ticket deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete ticket" });
  }
};

/* ================= VERIFY / SCAN TICKET ================= */

export const verifyGeneratedTicket = async (req, res) => {
  try {
    const { qr, ticketNumber } = req.body;

    const query = qr ? { qrCode: qr } : { ticketNumber };

    const ticket = await GeneratedTicket.findOne(query).populate("eventId");

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    if (
      req.user.role !== "admin" &&
      ticket.eventId.hostId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (ticket.status === "used") {
      return res.status(400).json({ success: false, message: "Already used" });
    }

    ticket.status = "used";
    ticket.checkedInAt = new Date();
    await ticket.save();

    // 🔔 NOTIFICATION: ENTRY CONFIRMED
    broadcastNotification(
      {
        type: "ticket_checked_in",
        title: "Entry Confirmed ✅",
        message: `Your entry for "${ticket.eventId.eventName}" has been confirmed.`,
        meta: {
          ticketId: ticket._id,
          eventId: ticket.eventId._id,
        },
        createdAt: new Date().toISOString(),
      },
      [ticket.userId]
    );

    res.json({ success: true, message: "Entry allowed", ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

/* ================= BOOK & GENERATE TICKETS ================= */

export const generateMultipleTickets = async (req, res) => {
  try {
    const { eventId, attendees, selectedTickets } = req.body;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    let totalAmount = 0;
    selectedTickets.forEach((t) => {
      totalAmount += t.price * t.quantity;
    });

    const booking = await Booking.create({
      eventId,
      userId,
      attendees,
      totalAmount,
      status: "confirmed",
      ticketCount: attendees.length,
      items: selectedTickets,
    });

    const generatedTickets = [];

    for (const attendee of attendees) {
      const ticketNumber =
        "TKT-" + Date.now() + "-" + crypto.randomBytes(4).toString("hex");

      const qrData = JSON.stringify({
        ticketNumber,
        bookingId: booking._id,
        eventId,
        attendeeName: attendee.fullName,
        ticketType: attendee.passType,
      });

      const newTicket = await GeneratedTicket.create({
        bookingId: booking._id,
        eventId,
        userId,
        ticketNumber,
        qrCode: qrData,
        attendee,
        ticketType: attendee.passType,
        price: attendee.price || 0,
      });

      generatedTickets.push(newTicket);
    }

    res.json({
      success: true,
      message: "Payment Successful! Tickets Generated",
      booking: {
        id: booking._id,
        eventName: event.title || event.eventName,
        totalAmount,
      },
      tickets: generatedTickets,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Ticket generation failed" });
  }
};

/* ================= 🔥 GET TICKETS BY USER ================= */

export const getTicketsByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const tickets = await GeneratedTicket.find({ userId })
      .populate({
        path: "eventId",
        select: "eventName eventImage date time fullAddress city",
      })
      .populate({
        path: "bookingId",
        select: "totalAmount createdAt",
      })
      .sort({ createdAt: -1 });

    if (!tickets.length) {
      return res.json({
        success: true,
        passes: [],
      });
    }

    // 🔥 Group tickets by booking + event
    const groupedPasses = {};

    tickets.forEach((ticket) => {
      const key = `${ticket.bookingId._id}_${ticket.eventId._id}`;

      if (!groupedPasses[key]) {
        groupedPasses[key] = {
          bookingId: ticket.bookingId._id,
          eventId: ticket.eventId._id,

          // UI fields
          eventName: ticket.eventId.eventName,
          eventImage: ticket.eventId.eventImage || null,
          date: ticket.eventId.date,
          time: ticket.eventId.time,
          location: `${ticket.eventId.fullAddress}, ${ticket.eventId.city}`,

          totalAmount: ticket.bookingId.totalAmount,
          tickets: [],
        };
      }

      groupedPasses[key].tickets.push({
        ticketId: ticket._id,
        ticketNumber: ticket.ticketNumber,
        ticketType: ticket.ticketType,
        attendeeName: ticket.attendee.fullName,
        qrCode: ticket.qrCode,
        status: ticket.status,
        price: ticket.price,
      });
    });

    return res.json({
      success: true,
      passes: Object.values(groupedPasses),
    });
  } catch (error) {
    console.error("❌ getTicketsByUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user tickets",
    });
  }
};