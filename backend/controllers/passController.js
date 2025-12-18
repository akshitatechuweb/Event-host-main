import Event from "../models/Event.js";
import Booking from "../models/Booking.js"; // Assuming you have a Booking model
import GeneratedTicket from "../models/GeneratedTicket.js";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// ===============================
// CREATE / ADD PASS (for custom pass creation)
// ===============================
export const addPass = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { type, price, totalQuantity } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const exists = event.passes.find(p => p.type === type);
    if (exists) {
      return res.status(400).json({ success: false, message: "Pass type already exists" });
    }

    event.passes.push({
      type,
      price,
      totalQuantity,
      remainingQuantity: totalQuantity
    });

    await event.save();

    res.json({ success: true, message: "Pass added", passes: event.passes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ===============================
// UPDATE PASS
// ===============================
export const updatePass = async (req, res) => {
  try {
    const { eventId, passId } = req.params;
    const { price, totalQuantity } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const pass = event.passes.id(passId);
    if (!pass) {
      return res.status(404).json({ success: false, message: "Pass not found" });
    }

    if (price !== undefined) pass.price = price;

    if (totalQuantity !== undefined) {
      const diff = totalQuantity - pass.totalQuantity;
      pass.totalQuantity = totalQuantity;
      pass.remainingQuantity += diff;

      if (pass.remainingQuantity < 0) {
        pass.remainingQuantity = 0;
      }
    }

    await event.save();

    res.json({ success: true, message: "Pass updated", pass });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ===============================
// DELETE PASS
// ===============================
export const deletePass = async (req, res) => {
  try {
    const { eventId, passId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    event.passes = event.passes.filter(p => p._id.toString() !== passId);
    await event.save();

    res.json({ success: true, message: "Pass deleted", passes: event.passes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ===============================
// GET ALL PASSES FOR EVENT
// ===============================
export const getPasses = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).select("passes");
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, passes: event.passes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ===============================
// GET USER'S PURCHASED PASSES
// ===============================
export const getMyPurchasedPasses = async (req, res) => {
  try {
    const userId = req.user._id; // From authMiddleware
    
    // Find all bookings for this user with status 'confirmed' or 'paid'
    const bookings = await Booking.find({
      user: userId,
      status: { $in: ['confirmed', 'paid'] }
    })
    .populate({
      path: 'event',
      select: 'title date location venue'
    })
    .populate({
      path: 'passId',
      select: 'type price'
    })
    .sort({ createdAt: -1 });

    if (!bookings || bookings.length === 0) {
      return res.json({ 
        success: true, 
        message: "No purchased passes found",
        passes: [] 
      });
    }

    // Format the response
    const purchasedPasses = bookings.map(booking => ({
      bookingId: booking._id,
      event: booking.event,
      pass: {
        type: booking.passId?.type || booking.passType,
        price: booking.passId?.price || booking.price
      },
      quantity: booking.quantity || 1,
      totalAmount: booking.totalAmount,
      purchaseDate: booking.createdAt,
      status: booking.status,
      qrCode: booking.qrCode // If you have QR codes
    }));

    res.json({ 
      success: true, 
      count: purchasedPasses.length,
      passes: purchasedPasses 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ===============================
// GET USER'S PURCHASED PASSES FOR SPECIFIC EVENT
// ===============================
export const getMyPassesForEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.params;

    const bookings = await Booking.find({
      user: userId,
      event: eventId,
      status: { $in: ['confirmed', 'paid'] }
    })
    .populate({
      path: 'event',
      select: 'title date location venue'
    })
    .populate({
      path: 'passId',
      select: 'type price'
    });

    if (!bookings || bookings.length === 0) {
      return res.json({ 
        success: true, 
        message: "No purchased passes found for this event",
        passes: [] 
      });
    }

    const purchasedPasses = bookings.map(booking => ({
      bookingId: booking._id,
      pass: {
        type: booking.passId?.type || booking.passType,
        price: booking.passId?.price || booking.price
      },
      quantity: booking.quantity || 1,
      totalAmount: booking.totalAmount,
      purchaseDate: booking.createdAt,
      status: booking.status,
      qrCode: booking.qrCode
    }));

    res.json({ 
      success: true, 
      count: purchasedPasses.length,
      passes: purchasedPasses 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const downloadPassTicket = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookingId } = req.params;

    // Fetch all generated tickets for this booking + populate event details
    const tickets = await GeneratedTicket.find({ bookingId, userId })
      .populate({
        path: "eventId",
        select: "eventName date time fullAddress city eventImage",
      })
      .sort({ createdAt: 1 })
      .lean();

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tickets found for this booking",
      });
    }

    const event = tickets[0].eventId;

    // Set PDF response headers
    const fileName = `Tickets-${bookingId}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Create PDF document
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    // === HEADER ===
    doc.fontSize(28).fillColor("#2c3e50").text("EVENT TICKET", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(20).fillColor("#34495e").text(event.eventName, { align: "center" });
    doc.moveDown(1.5);

    // === EVENT DETAILS ===
    doc.fontSize(12).fillColor("#7f8c8d");
    doc.text(`Date: ${new Date(event.date).toLocaleDateString("en-IN")}`);
    doc.text(`Time: ${event.time || "N/A"}`);
    doc.text(`Venue: ${event.fullAddress}, ${event.city}`);
    doc.moveDown(2);

    // === TICKET LOOP (Using for loop to allow await) ===
    for (let index = 0; index < tickets.length; index++) {
      const ticket = tickets[index];
      const ticketNo = index + 1;
      const totalTickets = tickets.length;

      // Ticket Title
      doc.fontSize(16).fillColor("#27ae60").font("Helvetica-Bold");
      doc.text(`Ticket ${ticketNo} of ${totalTickets}`, { underline: true });
      doc.moveDown(1.2);

      // Attendee Info (NO GENDER)
      doc.fontSize(13).fillColor("#2c3e50").font("Helvetica");
      doc.text(`Name: ${ticket.attendee.fullName}`);
      doc.text(`Email: ${ticket.attendee.email}`);
      doc.text(`Phone: ${ticket.attendee.phone}`);
      doc.text(`Pass Type: ${ticket.ticketType}`);
      doc.moveDown(0.8);

      // Price with Rupee Symbol
      doc.fontSize(16).fillColor("#c0392b").font("Helvetica-Bold");
       doc.text(`Price: Rs. ${ticket.price}`);
      doc.font("Helvetica").fontSize(13).fillColor("#2c3e50"); // reset font
      doc.moveDown(1.5);

      // Generate QR Code
      let qrData = ticket.ticketNumber;
      if (typeof ticket.qrCode === "string") {
        try {
          JSON.parse(ticket.qrCode);
          qrData = ticket.qrCode; // Use full JSON if valid
        } catch (e) {
          // Fallback to ticketNumber
        }
      }

      const qrImage = await QRCode.toDataURL(qrData);

      // Add QR Code to PDF
      doc.image(qrImage, {
        fit: [230, 230],
        align: "center",
        valign: "center",
      });

      doc.moveDown(1);
      doc.fontSize(11).fillColor("#7f8c8d").text("Scan this QR code at the entrance", { align: "center" });
      doc.fontSize(10).text(`Ticket ID: ${ticket.ticketNumber}`, { align: "center" });
      doc.moveDown(2);

      // Dashed line separator (except after last ticket)
      if (index < tickets.length - 1) {
        doc
          .strokeColor("#bdc3c7")
          .lineWidth(1)
          .dash(5, { space: 10 })
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke();
        doc.moveDown(3);
      }
    }

    // === FOOTER ===
    doc.moveDown(3);
    doc.fontSize(10).fillColor("#95a5a6").text("Thank you for booking with us!", { align: "center" });
    doc.text("This is your official entry ticket. Please carry a valid ID proof.", { align: "center" });

    // Finalize PDF
    doc.end();
  } catch (err) {
    console.error("PDF Generation Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to generate PDF ticket" });
    }
  }
};