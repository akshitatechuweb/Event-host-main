import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";

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

    //  Create ticket type
    const ticket = await Ticket.create({
      eventId,
      name,
      price,
      quantity: finalQuantity,
      refundPolicy,
    });

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
    if (!tickets.length) {
      return res.status(404).json({ success: false, message: "No tickets found for this event" });
    }

    res.json({ success: true, tickets });
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
    res.json({ success: true, message: "Ticket deleted successfully" });
  } catch (err) {
    console.error("Error deleting ticket:", err);
    res.status(500).json({ success: false, message: "Failed to delete ticket" });
  }
};
