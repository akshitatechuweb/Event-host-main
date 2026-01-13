import Event from "../models/Event.js";
import User from "../models/User.js";
import axios from "axios";
import { computeEventExtras } from "./eventUtils.js";

// ========================================================
// GET EVENTS (with optional trending filter)
// ========================================================
export const getEvents = async (req, res) => {
  try {
    const { userLat, userLng, trendingOnly, city, page = 1, limit = 10 } = req.query;
    const p = parseInt(page);
    const l = parseInt(limit);
    const skip = (p - 1) * l;

    let useGeoFilter = false;
    let coordinates = null; // [lng, lat]
    let isTrendingRequested = trendingOnly === "true";

    if (isTrendingRequested) {
      if (city) {
        // If city is specified, we consider events in that city as trending context
        useGeoFilter = true;
      } else if (userLat && userLng) {
        // Priority 1: Use explicit coords from frontend (for testing/manual override)
        coordinates = [parseFloat(userLng), parseFloat(userLat)];
        useGeoFilter = true;
      }
      // Priority 2: Auto fallback to logged-in user's saved location
      else if (req.user?._id) {
        const currentUser = await User.findById(req.user._id)
          .select("location")
          .lean();

        if (
          currentUser?.location?.coordinates &&
          currentUser.location.coordinates[0] !== 0 && // Avoid invalid [0,0]
          currentUser.location.coordinates[1] !== 0
        ) {
          coordinates = currentUser.location.coordinates; // already [lng, lat]
          useGeoFilter = true;
        }
      }
    }

    const filter = {};

    // 1. City Filter (Prioritize if provided)
    if (city) {
      filter.city = { $regex: new RegExp(`^${city}$`, "i") };
    }

    // 2. Geo Filter (Only if trending requested and NO city provided)
    if (useGeoFilter && coordinates && !city) {
      // Use $geoWithin to filter events within a radius and allow custom sorting (e.g., by eventDateTime).
      // $near / $nearSphere can cause errors when combined with non-geospatial sorts in some MongoDB contexts.
      const radiusMeters = 20000; // 20km
      const EARTH_RADIUS_METERS = 6378137; // approximate Earth radius
      const radiusRadians = radiusMeters / EARTH_RADIUS_METERS;
      filter.location = {
        $geoWithin: {
          $centerSphere: [coordinates, radiusRadians],
        },
      };
    }

    const [events, totalItems] = await Promise.all([
      Event.find(filter)
        .populate("hostId", "name role eventsHosted")
        .sort({ eventDateTime: 1 })
        .skip(skip)
        .limit(l)
        .lean(),
      Event.countDocuments(filter),
    ]);

    const formatted = events.map((ev) => {
      let imageUrl = ev.eventImage || null;
      try {
        if (imageUrl && imageUrl.startsWith("/")) {
          imageUrl = `${req.protocol}://${req.get("host")}${imageUrl}`;
        }
      } catch (err) { }

      let bookingPercentage = null;
      if (
        ev.maxCapacity &&
        ev.maxCapacity > 0 &&
        typeof ev.currentBookings === "number"
      ) {
        if (typeof ev.currentBookings === "number") {
          bookingPercentage = Math.round(
            (ev.currentBookings / ev.maxCapacity) * 100
          );
        }
      }

      let status = "";
      try {
        const now = new Date();
        const eventDate = ev.eventDateTime
          ? new Date(ev.eventDateTime)
          : ev.date
            ? new Date(ev.date)
            : null;
        const createdAt = ev.createdAt ? new Date(ev.createdAt) : now;
        const hoursUntilEvent = eventDate
          ? (eventDate - now) / (1000 * 60 * 60)
          : null;
        const daysUntilEvent =
          hoursUntilEvent !== null ? hoursUntilEvent / 24 : null;
        const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

        if (bookingPercentage !== null && bookingPercentage >= 85)
          status = "Almost Full";
        else if (
          daysUntilEvent !== null &&
          daysUntilEvent <= 2 &&
          daysUntilEvent > 0
        )
          status = "Filling Fast";
        else if (bookingPercentage !== null && bookingPercentage >= 50)
          status = "High Demand";
        else if (hoursSinceCreation <= 48) status = "Just Started";
      } catch (err) { }

      return {
        ...ev,
        eventImage: imageUrl,
        hostedBy:
          ev.hostId?.name ||
          (ev.hostId?.role === "admin" || ev.hostId?.role === "superadmin"
            ? "Admin"
            : "Unknown"),
        totalEventsHosted: ev.hostId?.eventsHosted || 0,
        trending: useGeoFilter, // Now true when nearby events are shown
        category: ev.category || "",
        bookingPercentage,
        status,
      };
    });

    return res.status(200).json({
      success: true,
      events: formatted,
      meta: {
        totalItems,
        currentPage: p,
        limit: l,
        totalPages: Math.ceil(totalItems / l),
      },
    });
  } catch (err) {
    console.error("Get Events Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================================================
// TOGGLE SAVE EVENT (Bookmark)
// ========================================================
export const toggleSaveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    console.log(
      `[DEBUG] toggleSaveEvent called: userId=${userId}, eventId=${eventId}`
    );

    const event = await Event.findById(eventId);
    if (!event) {
      console.log(`[DEBUG] Event not found: ${eventId}`);
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log(`[DEBUG] User not found: ${userId}`);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Ensure savedEvents array exists
    if (!user.savedEvents) {
      user.savedEvents = [];
    }

    // Check if already saved - trim and lower strings just in case
    const eventIdStr = eventId.toString().trim();
    const existingSaveIndex = user.savedEvents.findIndex(
      (save) => save.event && save.event.toString().trim() === eventIdStr
    );

    let isSaved = false;
    let message = "";

    if (existingSaveIndex !== -1) {
      // Already saved → unsave
      console.log(`[DEBUG] Unsaving event ${eventIdStr} for user ${userId}`);
      user.savedEvents.splice(existingSaveIndex, 1);
      message = "Event unsaved successfully";
    } else {
      // Not saved → save
      console.log(`[DEBUG] Saving event ${eventIdStr} for user ${userId}`);
      user.savedEvents.push({ event: eventId });
      isSaved = true;
      message = "Event saved successfully";
    }

    try {
      await user.save();
      console.log(
        `[DEBUG] User profile saved successfully with updated savedEvents`
      );
    } catch (saveError) {
      console.error(`[DEBUG] Failed to save user profile:`, saveError);
      return res
        .status(500)
        .json({
          success: false,
          message: "Database save failed",
          error: saveError.message,
        });
    }

    const totalSaves = await User.countDocuments({
      "savedEvents.event": eventId,
    });

    console.log(`[DEBUG] totalSaves for event ${eventIdStr}: ${totalSaves}`);

    return res.status(200).json({
      success: true,
      message,
      isSaved,
      totalSaves,
    });
  } catch (err) {
    console.error("Toggle Save Event Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================================================
// GET SAVED EVENTS (with pagination)
// ========================================================
export const getSavedEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId).select("savedEvents");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Extract event IDs in order of savedAt (newest first)
    const savedEventEntries = user.savedEvents
      .sort((a, b) => b.savedAt - a.savedAt) // descending
      .slice(skip, skip + limit);

    const eventIds = savedEventEntries.map((entry) => entry.event);

    // Fetch full event details
    let events = [];
    if (eventIds.length > 0) {
      events = await Event.find({ _id: { $in: eventIds } })
        .populate("hostId", "name role eventsHosted")
        .lean();

      // Preserve order from savedEvents (important!)
      const eventMap = {};
      events.forEach((ev) => {
        eventMap[ev._id.toString()] = ev;
      });

      events = eventIds.map((id) => eventMap[id.toString()]).filter(Boolean);
    }

    // Apply same formatting as other APIs (image URL, status, booking %, etc.)
    const formatted = events.map((ev) => {
      const extras = computeEventExtras(ev, req);
      return {
        ...ev,
        eventImage: extras.eventImage,
        bookingPercentage: extras.bookingPercentage,
        status: extras.status,
        hostedBy:
          ev.hostId?.name ||
          (ev.hostId?.role === "admin" || ev.hostId?.role === "superadmin"
            ? "Admin"
            : "Unknown"),
        totalEventsHosted: ev.hostId?.eventsHosted || 0,
        category: ev.category || "",
      };
    });

    // Total count for pagination
    const total = user.savedEvents.length;

    return res.status(200).json({
      success: true,
      savedEvents: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error("Get Saved Events Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
