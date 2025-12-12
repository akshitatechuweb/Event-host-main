import crypto from "crypto";

import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import GeneratedTicket from "../models/GeneratedTicket.js";


// Create a new ticket type (Host only)
export const createTicket = async (req, res) => {
  try {
    const { eventId, name, price, quantity, refundPolicy } = req.body;
    const hostId = req.user._id;

    //  Check if event exists and belongs to this host
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.hostId.toString() !== hostId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to add tickets for this event" });
    }

     const finalQuantity =
      typeof quantity === "number"
        ? { total: quantity, available: quantity }
        : quantity;

    //  Create ticket type document (legacy usage) and also update Event.passes when name matches Male/Female/Couple
    const ticket = await Ticket.create({
      eventId,
      name,
      price,
      quantity: finalQuantity,
      refundPolicy,
    });

    // If the ticket name matches one of the 3 pass types, update event.passes accordingly
    const passTypes = ["Male", "Female", "Couple"];
    if (passTypes.includes(name)) {
      const pass = event.passes.find((p) => p.type === name);
      if (pass) {
        pass.price = price;
        pass.totalQuantity = typeof quantity === 'number' ? quantity : (quantity.total || pass.totalQuantity);
        pass.remainingQuantity = pass.totalQuantity; // Reset remaining on update; or more complex logic may be added
      } else {
        event.passes.push({ type: name, price, totalQuantity: typeof quantity === 'number' ? quantity : (quantity.total || 0), remainingQuantity: typeof quantity === 'number' ? quantity : (quantity.available || 0) });
      }
      await event.save();
    }

    res.status(201).json({ success: true, message: "Ticket type created", ticket });
  } catch (err) {
    console.error("Error creating ticket:", err);
    res.status(500).json({ success: false, message: "Failed to create ticket type" });
  }
};

// Get all tickets for a specific event
export const getTicketsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const tickets = await Ticket.find({ eventId });
    const event = await Event.findById(eventId);
    const passes = event ? event.passes || [] : [];

    res.json({ success: true, tickets, passes });
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ success: false, message: "Failed to fetch tickets" });
  }
};

// Update ticket type (Host)
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const ticket = await Ticket.findById(id).populate("eventId");
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    // Check ownership
    if (ticket.eventId.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this ticket" });
    }

    Object.assign(ticket, updates);
    await ticket.save();
    // Update event passes if this ticket maps to a pass type
    const passTypes = ["Male", "Female", "Couple"];
    if (passTypes.includes(ticket.name)) {
      const ev = ticket.eventId; // populated
      const pass = ev.passes.find((p) => p.type === ticket.name);
      if (pass) {
        pass.price = ticket.price;
        const totalQ = typeof ticket.quantity === 'object' ? (ticket.quantity.total || 0) : (ticket.quantity || 0);
        pass.totalQuantity = totalQ;
        pass.remainingQuantity = Math.min(pass.remainingQuantity || totalQ, totalQ);
        await ev.save();
      }
    }

    res.json({ success: true, message: "Ticket updated", ticket });
  } catch (err) {
    console.error("Error updating ticket:", err);
    res.status(500).json({ success: false, message: "Failed to update ticket" });
  }
};

// Delete ticket (Host or Admin)
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id).populate("eventId");
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const user = req.user;
    if (
      user.role !== "admin" &&
      ticket.eventId.hostId.toString() !== user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this ticket" });
    }

    await Ticket.findByIdAndDelete(id);
    // If deleting a pass type ticket, reset event pass
    const passTypes = ["Male", "Female", "Couple"];
    if (passTypes.includes(ticket.name)) {
      const ev = ticket.eventId; // populated
      const passIndex = ev.passes.findIndex((p) => p.type === ticket.name);
      if (passIndex !== -1) {
        ev.passes[passIndex] = { type: ticket.name, price: 0, totalQuantity: 0, remainingQuantity: 0 };
        await ev.save();
      }
    }
    res.json({ success: true, message: "Ticket deleted successfully" });
  } catch (err) {
    console.error("Error deleting ticket:", err);
    res.status(500).json({ success: false, message: "Failed to delete ticket" });
  }
};

// Verify and check-in a generated ticket (scan QR)
export const verifyGeneratedTicket = async (req, res) => {
  try {
    const { qr, ticketNumber } = req.body;
    const hostId = req.user._id;

    let query = {};
    if (qr) {
      // qr is expected to be a JSON string stored as qrCode in GeneratedTicket
      query.qrCode = qr;
    } else if (ticketNumber) {
      query.ticketNumber = ticketNumber;
    } else {
      return res.status(400).json({ success: false, message: "qr or ticketNumber required" });
    }

    const genTicket = await GeneratedTicket.findOne(query).populate('eventId');
    if (!genTicket) return res.status(404).json({ success: false, message: "Ticket not found" });

    // Only the event host or admin can mark as used
    if (req.user.role !== 'admin' && genTicket.eventId.hostId.toString() !== hostId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to scan this ticket" });
    }

    if (genTicket.status === 'used') {
      return res.status(400).json({ success: false, message: "Ticket already used" });
    }

    genTicket.status = 'used';
    genTicket.checkedInAt = new Date();
    await genTicket.save();

    return res.json({ success: true, message: "Entry allowed", ticket: genTicket });
  } catch (err) {
    console.error('Error verifying ticket', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const generateMultipleTickets = async (req, res) => {
  try {
    const { eventId, attendees, selectedTickets } = req.body;
    const userId = req.user?._id || null;

    // Validate event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Validate requests
    if (!Array.isArray(selectedTickets) || selectedTickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "selectedTickets must be a non-empty array",
      });
    }

    if (!Array.isArray(attendees) || attendees.length === 0) {
      return res.status(400).json({
        success: false,
        message: "attendees must be a non-empty array",
      });
    }

    // Calculate total amount and validate attendees vs selectedTickets
    let totalAmount = 0;
    let totalPersonsRequired = 0;
    selectedTickets.forEach((item) => {
      totalAmount += item.price * item.quantity;
      if (item.type === "Couple") {
        totalPersonsRequired += item.quantity * 2;
      } else {
        totalPersonsRequired += item.quantity;
      }
    });

    if (attendees.length !== totalPersonsRequired) {
      return res.status(400).json({ success: false, message: "attendees length does not match selected tickets quantity" });
    }

    // capacity check
    if (typeof event.maxCapacity === 'number' && (event.currentBookings || 0) + totalPersonsRequired > event.maxCapacity) {
      return res.status(400).json({ success: false, message: "Event sold out or insufficient capacity" });
    }

    // validate distribution by passType
    const expectedCounts = {};
    selectedTickets.forEach((item) => {
      expectedCounts[item.type] = (expectedCounts[item.type] || 0) + (item.type === 'Couple' ? item.quantity * 2 : item.quantity);
    });
    const actualCounts = {};
    attendees.forEach((a) => { actualCounts[a.passType] = (actualCounts[a.passType] || 0) + 1; });
    for (const [ptype, expected] of Object.entries(expectedCounts)) {
      if ((actualCounts[ptype] || 0) !== expected) {
        return res.status(400).json({ success: false, message: `attendees distribution does not match selected tickets for pass ${ptype}` });
      }
    }

    // Check pass stock availability & reduce remainingQuantity on Event
    const eventPasses = event.passes || [];
    const passMap = {};
    eventPasses.forEach((p) => {
      passMap[p.type] = p;
    });

    for (const item of selectedTickets) {
      const pass = passMap[item.type];
      if (!pass) {
        return res.status(400).json({ success: false, message: `Pass type ${item.type} not available for this event` });
      }
      const required = item.type === "Couple" ? item.quantity : item.quantity;
      if (pass.remainingQuantity < item.quantity) {
        return res.status(400).json({ success: false, message: `${item.type} pass sold out or insufficient stock` });
      }
    }

    // Deduct stock
    for (const item of selectedTickets) {
      const pass = passMap[item.type];
      pass.remainingQuantity -= item.quantity;
    }
    await event.save();
    event.currentBookings = (event.currentBookings || 0) + attendees.length;
    await event.save();

    // Create booking entry
    const booking = await Booking.create({
      eventId,
      userId,
      attendees,
      totalAmount,
      status: "confirmed",
      orderId: "ORDER-" + Date.now(),
      ticketCount: attendees.length,
      items: selectedTickets,
    });

    // Generate tickets
    const generatedTickets = [];

    // Create tickets per attendee - attendees array must map to pass types
    for (const attendee of attendees) {
      const ticketNumber =
        "TKT-" + Date.now() + "-" + crypto.randomBytes(4).toString("hex").toUpperCase();

      const qrData = JSON.stringify({
        ticketNumber,
        bookingId: booking._id,
        eventId,
        attendeeName: attendee.fullName,
        ticketType: attendee.passType,
      });

      // find price for the passType
      const pass = passMap[attendee.passType];
      const price = pass ? (pass.type === 'Couple' ? (pass.price / 2) : pass.price) : 0;

      const newTicket = await GeneratedTicket.create({
        bookingId: booking._id,
        eventId,
        userId,
        ticketNumber,
        qrCode: qrData,
        attendee,
        ticketType: attendee.passType,
        price,
      });

      generatedTickets.push(newTicket);
    }

    return res.json({
      success: true,
      message: "Booking & Tickets generated successfully",
      booking,
      tickets: generatedTickets,
    });

  } catch (error) {
    console.error("❌ Book & Generate Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to complete booking and ticket generation",
    });
  }
};