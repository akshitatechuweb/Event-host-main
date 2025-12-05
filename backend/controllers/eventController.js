import Event from "../models/Event.js";
import User from "../models/User.js";

// Host creates a new event
export const createEvent = async (req, res) => {
  try {
    const { title, description, category, location, startDateTime, endDateTime, capacity, rules, media } = req.body;
    const user = req.user;

    // Ensure only verified hosts can create events
    if (user.role !== "host" || !user.isHostVerified) {
      return res.status(403).json({
        success: false,
        message: "Only verified hosts can create events",
      });
    }

    const newEvent = await Event.create({
      hostId: user._id,
      title,
      description,
      category,
      location,
      startDateTime,
      endDateTime,
      capacity,
      rules,
      media,
      status: "pending", 
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully. Awaiting admin approval.",
      event: newEvent,
    });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ success: false, message: "Server error while creating event" });
  }
};

// 🔹 Admin updates any event details
export const updateEventByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await Event.findByIdAndUpdate(id, updates, { new: true });
    if (!event)
      return res.status(404).json({ success: false, message: "Event not found" });

    res.json({ success: true, message: "Event updated successfully", event });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ success: false, message: "Server error while updating event" });
  }
};

//  Admin approves an event
export const approveEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    event.status = "live";
    await event.save();

    res.json({ success: true, message: "Event approved successfully", event });
  } catch (err) {
    console.error("Error approving event:", err);
    res.status(500).json({ success: false, message: "Server error while approving event" });
  }
};

//  Admin rejects an event
export const rejectEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    event.status = "canceled";
    await event.save();

    res.json({ success: true, message: "Event rejected successfully", event });
  } catch (err) {
    console.error("Error rejecting event:", err);
    res.status(500).json({ success: false, message: "Server error while rejecting event" });
  }
};

//  Get all events (admin, with pagination + filter)
export const getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};

    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      Event.find(query)
        .populate("hostId", "name phone city")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(query),
    ]);

    res.json({
      success: true,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalEvents: total,
      events,
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
};

//  Host can view their own events
export const getMyEvents = async (req, res) => {
  try {
    const user = req.user;

    const events = await Event.find({ hostId: user._id }).sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (err) {
    console.error("Error fetching host events:", err);
    res.status(500).json({ success: false, message: "Failed to fetch your events" });
  }
};

// 🔹 Public route — fetch only verified/live events
export const getVerifiedEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find({ status: "live" })
        .populate("hostId", "name city")
        .sort({ startDateTime: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments({ status: "live" }),
    ]);

    res.json({
      success: true,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalEvents: total,
      events,
    });
  } catch (err) {
    console.error("Error fetching verified events:", err);
    res.status(500).json({ success: false, message: "Failed to fetch verified events" });
  }
};
