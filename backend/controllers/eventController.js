import Event from "../models/Event.js";
import User from "../models/User.js";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const DEFAULT_RADIUS = 10000;

// ========================================================
// ADMIN — CREATE EVENT (with permission check + pass setup)
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
      // ========================================================
      // 🆕 NEW FIELDS
      // ========================================================
      whatsIncludedInTicket,
      expectedGuestCount,
      maleToFemaleRatio,
      // ========================================================
      category,
      thingsToKnow,
      partyTerms,
      maxCapacity
    } = req.body;

    // Validate host
    const host = await User.findById(hostId);
    if (!host) {
      return res.status(404).json({ success: false, message: "Host not found" });
    }

    if (host.role !== "host") {
      return res.status(403).json({
        success: false,
        message: "Only hosts are allowed to create events",
      });
    }

    // ========================================================
    // 🛑 NEW LOGIC: Host must have eventCreationCredits > 0
    // ========================================================
    if (host.eventCreationCredits <= 0) {
      return res.status(403).json({
        success: false,
        message: "You are not approved to create an event. Request approval from admin.",
      });
    }

    // Validate date
    if (!date) {
      return res.status(400).json({ success: false, message: "Event date is required" });
    }

    const eventDate = new Date(date);
    const weekday = eventDate.toLocaleDateString("en-US", { weekday: "long" });

    // Build eventDateTime
    let eventDateTime = null;
    if (time) {
      const [h, m] = time.split(":");
      eventDateTime = new Date(eventDate);
      eventDateTime.setHours(parseInt(h), parseInt(m), 0, 0);
    }

    // ========================================================
    // GEOLOCATION — Convert address → coordinates
    // ========================================================
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

    // ========================================================
    // Event IMAGE upload path
    // ========================================================
    let imagePath = eventImage;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // ========================================================
    // INITIAL PASSES SETUP (Male / Female / Couple)
    // ========================================================
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

    const normalizedPasses = defaultPassTypes.map((type) => {
      const found = inputPasses.find((p) => p.type === type) || {};
      const totalQ = found.totalQuantity || 0;

      return {
        type,
        price: found.price || 0,
        totalQuantity: totalQ,
        remainingQuantity:
          typeof found.remainingQuantity === "number"
            ? found.remainingQuantity
            : totalQ,
      };
    });

    // ========================================================
    // CREATE EVENT
    // ========================================================
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
      // ========================================================
      // 🆕 NEW FIELDS ADDED TO EVENT CREATION
      // ========================================================
      whatsIncludedInTicket,
      expectedGuestCount,
      maleToFemaleRatio,
      // ========================================================
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

    // ========================================================
    // 🟢 IMPORTANT: Host uses up ONE event creation permission
    // ========================================================
    host.eventCreationCredits -= 1;
    await host.save();

    // Update host stats
    const updatedHost = await User.findByIdAndUpdate(
      hostId,
      { $inc: { eventsHosted: 1 } },
      { new: true, select: "name eventsHosted" }
    );

    // Response
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
      .sort({ eventDateTime: 1 });

    const formatted = events.map((ev) => ({
      ...ev.toObject(),
      hostedBy: ev.hostId?.name,
      totalEventsHosted: ev.hostId?.eventsHosted || 0,
      trending: trendingOnly === "true",
    }));

    return res.status(200).json({ success: true, events: formatted });

  } catch (err) {
    console.error("Get Events Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};