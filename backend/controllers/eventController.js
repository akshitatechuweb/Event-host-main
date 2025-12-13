import Event from "../models/Event.js";
import User from "../models/User.js";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const DEFAULT_RADIUS = 10000;

// ========================================================
// ADMIN/SUPERADMIN — CREATE EVENT
// ========================================================
export const adminCreateEvent = async (req, res) => {
  try {
    const {
      hostId,
      eventName,
      subtitle,
      eventImage,
      date,
      time,
      fullAddress,
      city,
      about,
      partyFlow,
      partyEtiquette,
      whatsIncluded,
      houseRules,
      howItWorks,
      cancellationPolicy,
      ageRestriction,
      whatsIncludedInTicket,
      expectedGuestCount,
      maleToFemaleRatio,
      category,
      thingsToKnow,
      partyTerms,
      maxCapacity,
    } = req.body;

    // Validate host
    const host = await User.findById(hostId);
    if (!host) {
      return res.status(404).json({ success: false, message: "Host not found" });
    }

    if (host.role !== "host") {
      return res.status(403).json({
        success: false,
        message: "Only hosts can be assigned to events",
      });
    }

    if (host.eventCreationCredits <= 0) {
      return res.status(403).json({
        success: false,
        message: "This host is not approved to create an event. Request approval from admin.",
      });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: "Event date is required" });
    }

    const eventDate = new Date(date);
    const weekday = eventDate.toLocaleDateString("en-US", { weekday: "long" });

    let eventDateTime = null;
    if (time) {
      const [h, m] = time.split(":");
      eventDateTime = new Date(eventDate);
      eventDateTime.setHours(parseInt(h), parseInt(m), 0, 0);
    }

    // Geocode address
    const geoRes = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: fullAddress,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (!geoRes.data.results.length) {
      return res.status(400).json({ success: false, message: "Invalid event address" });
    }

    const location = geoRes.data.results[0].geometry.location;

    // Handle image upload
    let imagePath = eventImage;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Parse passes (only type and price from frontend)
    let inputPasses = [];
    try {
      if (req.body.passes) {
        inputPasses = JSON.parse(req.body.passes);
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format for passes",
      });
    }

    if (!Array.isArray(inputPasses)) {
      return res.status(400).json({
        success: false,
        message: "passes must be a JSON array",
      });
    }

    const defaultPassTypes = ["Male", "Female", "Couple"];
    const totalQty = maxCapacity || 0; // Use maxCapacity as quantity for all

    const normalizedPasses = defaultPassTypes.map((type) => {
      const found = inputPasses.find((p) => p.type === type) || {};
      return {
        type,
        price: found.price || 0,
        totalQuantity: totalQty,
        remainingQuantity: totalQty, // initially full
      };
    });

    // Create event
    const newEvent = await Event.create({
      hostId,
      hostedBy: host.name,
      eventName,
      subtitle,
      eventImage: imagePath,
      date: eventDate,
      time,
      day: weekday,
      eventDateTime,
      fullAddress,
      city,
      about,
      partyFlow,
      partyEtiquette,
      whatsIncluded,
      houseRules,
      howItWorks,
      cancellationPolicy,
      ageRestriction,
      whatsIncludedInTicket,
      expectedGuestCount,
      maleToFemaleRatio,
      category,
      thingsToKnow,
      partyTerms,
      maxCapacity,
      passes: normalizedPasses,
      currentBookings: 0,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
      },
    });

    // Deduct credit and update host stats
    host.eventCreationCredits -= 1;
    await host.save();

    await User.findByIdAndUpdate(
      hostId,
      { $inc: { eventsHosted: 1 } },
      { new: true }
    );

    const updatedHost = await User.findById(hostId).select("eventsHosted");

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: {
        ...newEvent.toObject(),
        totalEventsHosted: updatedHost.eventsHosted,
      },
    });

  } catch (err) {
    console.error("Create Event Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================================================
// ADMIN/SUPERADMIN — UPDATE EVENT
// ========================================================
export const adminUpdateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      hostId,
      eventName,
      subtitle,
      eventImage,
      date,
      time,
      fullAddress,
      city,
      about,
      partyFlow,
      partyEtiquette,
      whatsIncluded,
      houseRules,
      howItWorks,
      cancellationPolicy,
      ageRestriction,
      whatsIncludedInTicket,
      expectedGuestCount,
      maleToFemaleRatio,
      category,
      thingsToKnow,
      partyTerms,
      maxCapacity,
    } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Update host if changed
    if (hostId && hostId !== event.hostId.toString()) {
      const newHost = await User.findById(hostId);
      if (!newHost || newHost.role !== "host") {
        return res.status(400).json({ success: false, message: "Invalid host" });
      }
      await User.findByIdAndUpdate(event.hostId, { $inc: { eventsHosted: -1 } });
      await User.findByIdAndUpdate(hostId, { $inc: { eventsHosted: 1 } });
      event.hostId = hostId;
      event.hostedBy = newHost.name;
    }

    // Update date/time
    if (date) {
      const eventDate = new Date(date);
      event.date = eventDate;
      event.day = eventDate.toLocaleDateString("en-US", { weekday: "long" });
      if (time) {
        const [h, m] = time.split(":");
        const dt = new Date(eventDate);
        dt.setHours(parseInt(h), parseInt(m), 0, 0);
        event.eventDateTime = dt;
        event.time = time;
      }
    } else if (time) {
      event.time = time;
    }

    // Update location if address changed
    if (fullAddress && fullAddress !== event.fullAddress) {
      const geoRes = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: { address: fullAddress, key: GOOGLE_MAPS_API_KEY },
        }
      );
      if (geoRes.data.results.length) {
        const loc = geoRes.data.results[0].geometry.location;
        event.location = { type: "Point", coordinates: [loc.lng, loc.lat] };
        event.fullAddress = fullAddress;
      }
    }

    // Update image
    if (req.file) {
      event.eventImage = `/uploads/${req.file.filename}`;
    } else if (eventImage) {
      event.eventImage = eventImage;
    }

    // Update passes (only type & price from input)
    if (req.body.passes) {
      let inputPasses = [];
      try {
        inputPasses = JSON.parse(req.body.passes);
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid JSON format for passes" });
      }

      if (!Array.isArray(inputPasses)) {
        return res.status(400).json({ success: false, message: "passes must be an array" });
      }

      const defaultPassTypes = ["Male", "Female", "Couple"];
      const totalQty = maxCapacity ?? event.maxCapacity ?? 0;

      const normalizedPasses = defaultPassTypes.map((type) => {
        const found = inputPasses.find((p) => p.type === type) || {};
        return {
          type,
          price: found.price ?? 0,
          totalQuantity: totalQty,
          remainingQuantity: totalQty,
        };
      });

      event.passes = normalizedPasses;
    }

    // Update other fields if provided
    const fieldsToUpdate = {
      eventName,
      subtitle,
      city,
      about,
      partyFlow,
      partyEtiquette,
      whatsIncluded,
      houseRules,
      howItWorks,
      cancellationPolicy,
      ageRestriction,
      whatsIncludedInTicket,
      expectedGuestCount,
      maleToFemaleRatio,
      category,
      thingsToKnow,
      partyTerms,
      maxCapacity,
    };

    Object.keys(fieldsToUpdate).forEach((key) => {
      if (fieldsToUpdate[key] !== undefined) {
        event[key] = fieldsToUpdate[key];
      }
    });

    await event.save();

    const updatedHost = await User.findById(event.hostId).select("eventsHosted");

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: {
        ...event.toObject(),
        totalEventsHosted: updatedHost?.eventsHosted || 0,
      },
    });

  } catch (err) {
    console.error("Update Event Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================================================
// GET EVENTS (with optional trending filter)
// ========================================================
export const getEvents = async (req, res) => {
  try {
    const { userLat, userLng, trendingOnly } = req.query;
    let filter = {};

    if (trendingOnly === "true" && userLat && userLng) {
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(userLng), parseFloat(userLat)],
          },
          $maxDistance: DEFAULT_RADIUS,
        },
      };
    }

    const events = await Event.find(filter)
      .populate("hostId", "name role eventsHosted")
      .sort({ eventDateTime: 1 })
      .lean(); // Clean output + faster

    const formatted = events.map((ev) => ({
      ...ev,
      hostedBy: ev.hostId?.name || "Unknown",
      totalEventsHosted: ev.hostId?.eventsHosted || 0,
      trending: trendingOnly === "true",
    }));

    return res.status(200).json({ success: true, events: formatted });

  } catch (err) {
    console.error("Get Events Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};