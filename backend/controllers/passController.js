import Event from "../models/Event.js";
import Booking from "../models/Booking.js"; // Assuming you have a Booking model

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