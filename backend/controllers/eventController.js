import Event from "../models/Event.js";
import User from "../models/User.js";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY; // put your key in .env
const DEFAULT_RADIUS = 10000; // 10 km

// Admin creates event (auto-geocoding)
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
      ageRestriction,
      genderPreference,
      categories
    } = req.body;

    const host = await User.findById(hostId);
    if (!host) return res.status(404).json({ success: false, message: "Host not found" });

    // Geocode
    const geoRes = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: { address: fullAddress, key: process.env.GOOGLE_MAPS_API_KEY }
    });

    if (!geoRes.data.results.length)
      return res.status(400).json({ success: false, message: "Invalid address for geocoding" });

    const location = geoRes.data.results[0].geometry.location; // {lat, lng}

    const newEvent = await Event.create({
      hostId,
      hostedBy: host.name,
      eventName,
      eventImage: req.file ? `/uploads/${req.file.filename}` : eventImage,
      date,
      time,
      fullAddress,
      city,
      entryFees,
      about,
      ageRestriction,
      genderPreference: genderPreference || "both",
      categories,
      location: { type: "Point", coordinates: [location.lng, location.lat] }
    });

    res.status(201).json({ success: true, message: "Event created successfully", event: newEvent });
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
          $maxDistance: DEFAULT_RADIUS
        }
      };
    }

    const events = await Event.find(filter).sort({ dateTime: 1 });

    const updatedEvents = events.map(ev => ({ ...ev._doc, trending: trendingOnly === "true" }));

    res.status(200).json({ success: true, events: updatedEvents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
