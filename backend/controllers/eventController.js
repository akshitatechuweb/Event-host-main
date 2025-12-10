import Event from "../models/Event.js";
import User from "../models/User.js";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const DEFAULT_RADIUS = 10000; // 10 km

// controllers/eventController.js

export const adminCreateEvent = async (req, res) => {
  try {
    const {
      hostId,
      eventName,
      eventImage,
      date,
      time,
      fullAddress,
      city,
      entryFees,
      about,
      partyFlow,
      partyEtiquette,
      whatsIncluded,
      houseRules,
      howItWorks,
      cancellationPolicy,
      ageRestriction,
      genderPreference,
      category
    } = req.body;

    // 1️⃣ Find host
    const host = await User.findById(hostId);
    if (!host) {
      return res.status(404).json({ success: false, message: "Host not found" });
    }

    // 2️⃣ Allow ONLY hosts
    if (host.role !== "host") {
      return res.status(403).json({
        success: false,
        message: "Only hosts are allowed to create events",
      });
    }

    // 3️⃣ Date check
    if (!date) {
      return res.status(400).json({ success: false, message: "Event date required" });
    }

    const eventDate = new Date(date);

    const weekday = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    let eventDateTime = null;

    if (time) {
      const [h, m] = time.split(":");
      eventDateTime = new Date(eventDate);
      eventDateTime.setHours(parseInt(h), parseInt(m), 0, 0);
    }

    // 4️⃣ Geocode
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
      return res.status(400).json({ success: false, message: "Invalid address" });
    }

    const location = geoRes.data.results[0].geometry.location;

    // 5️⃣ Create event
    const newEvent = await Event.create({
      hostId,
      hostedBy: host.name,
      eventName,
      eventImage: req.file ? `/uploads/${req.file.filename}` : eventImage,
      date: eventDate,
      time,
      day: weekday,
      eventDateTime,
      fullAddress,
      city,
      entryFees,
      about,
      partyFlow,
      partyEtiquette,
      whatsIncluded,
      houseRules,
      howItWorks,
      cancellationPolicy,
      ageRestriction,
      genderPreference: genderPreference || "both",
      category,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
      },
    });

    // 6️⃣ Increase host's event count
    const updatedHost = await User.findByIdAndUpdate(
      hostId,
      { $inc: { eventsHosted: 1 } },
      { new: true, select: "name eventsHosted" }
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: {
        ...newEvent.toObject(),
        totalEventsHosted: updatedHost.eventsHosted,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// Get events (all or trending nearby)
export const getEvents = async (req, res) => {
  try {
    const { userLat, userLng, trendingOnly } = req.query;
    let filter = {};

    if (trendingOnly === "true" && userLat && userLng) {
      filter.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(userLng), parseFloat(userLat)] },
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

    res.status(200).json({ success: true, events: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


