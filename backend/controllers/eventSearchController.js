// src/controllers/eventSearchController.js

import Event from "../models/Event.js";
import User from "../models/User.js";

const DEFAULT_NEARBY_RADIUS = 30000; // 30km — ideal for Delhi-NCR

const addEventExtras = (event, req) => {
  let imageUrl = event.eventImage;
  if (imageUrl && imageUrl.startsWith("/")) {
    imageUrl = `${req.protocol}://${req.get("host")}${imageUrl}`;
  }

  const bookingPercentage =
    event.maxCapacity > 0
      ? Math.round((event.currentBookings / event.maxCapacity) * 100)
      : null;

  return {
    ...event,
    eventImage: imageUrl,
    bookingPercentage,
    hostedBy: event.hostId?.name || event.hostedBy || "Unknown",
    totalEventsHosted: event.hostId?.eventsHosted || 0,
  };
};

export const searchEvents = async (req, res) => {
  try {
    const {
      q = "",
      city = "",
      address = "",
      category = "",
      date = "",
      showPast = "true",
      nearby = "true", // 👈 NEW: enable nearby search (default true)
      page = 1,
      limit = 15,
    } = req.query;

    const filters = {};
    let useGeoNearby = false;
    let userCoordinates = null;

    // 🔍 TEXT SEARCH
    if (q.trim()) {
      filters.$text = { $search: q.trim() };
    }

    // 🎯 CATEGORY
    if (category.trim()) {
      filters.category = new RegExp(category.trim(), "i");
    }

    // 📍 ADDRESS / LOCALITY
    if (address.trim()) {
      filters.fullAddress = new RegExp(address.trim(), "i");
    }

    // 📅 DATE FILTER
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      filters.eventDateTime = { $gte: start, $lte: end };
    }

    // ⏳ FUTURE EVENTS ONLY?
    if (showPast !== "true") {
      filters.eventDateTime = {
        ...(filters.eventDateTime || {}),
        $gte: new Date(),
      };
    }

    // 🏙️ CITY FILTER LOGIC (Smart for NCR)
    if (city.trim()) {
      // User explicitly wants only this city
      filters.city = new RegExp(city.trim(), "i");
    } 
    else if (req.user?._id && nearby === "true") {
      // Auto-detect user's location for nearby results
      const currentUser = await User.findById(req.user._id)
        .select("location")
        .lean();

      if (
        currentUser?.location?.coordinates &&
        currentUser.location.coordinates[0] !== 0 &&
        currentUser.location.coordinates[1] !== 0
      ) {
        userCoordinates = currentUser.location.coordinates; // [lng, lat]
        useGeoNearby = true;
      }
    }

    // 🌍 APPLY GEO NEARBY FILTER (Best for Delhi-NCR!)
    if (useGeoNearby && userCoordinates) {
      filters.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: userCoordinates,
          },
          $maxDistance: DEFAULT_NEARBY_RADIUS, // 30km
        },
      };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    let query = Event.find(filters)
      .populate("hostId", "name eventsHosted")
      .skip(skip)
      .limit(limitNum)
      .lean();

    // 🔃 SORTING
    if (q.trim()) {
      query = query.sort({
        score: { $meta: "textScore" },
        eventDateTime: -1,
      });
    } else if (useGeoNearby) {
      // For nearby searches, sort by distance (closest first)
      query = query.sort({ eventDateTime: -1 }); // or add distance if needed
    } else {
      query = query.sort({ eventDateTime: -1 });
    }

    const [events, total] = await Promise.all([
      query,
      Event.countDocuments(filters),
    ]);

    const formatted = events.map((ev) => addEventExtras(ev, req));

    return res.status(200).json({
      success: true,
      data: {
        events: formatted,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1,
        },
        appliedFilters: {
          textSearch: !!q.trim(),
          city: city.trim() || (req.user?.city || "Nearby"),
          nearbyApplied: useGeoNearby,
          radiusKm: useGeoNearby ? DEFAULT_NEARBY_RADIUS / 1000 : null,
        },
      },
    });
  } catch (err) {
    console.error("Search Events Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to search events",
    });
  }
};