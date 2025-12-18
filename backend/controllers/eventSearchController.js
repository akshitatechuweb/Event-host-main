// src/controllers/eventSearchController.js
import Event from "../models/Event.js";

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
    status: event.status || "",
    thingsToKnow: event.thingsToKnow || "",
    hostedBy: event.hostId?.name || event.hostedBy || "Unknown",
    totalEventsHosted: event.hostId?.eventsHosted || 0,
  };
};

export const searchEvents = async (req, res) => {
  try {
    /* 🔐 REQUIRE LOGIN */
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Login required to search events",
      });
    }

    const {
      q = "",
      city = "",
      address = "",
      category = "",
      date = "",
      showPast = "false",
      page = 1,
      limit = 15,
    } = req.query;

    const filters = {};

    /* 🔍 TEXT SEARCH */
    if (q.trim()) {
      filters.$text = { $search: q.trim() };
    }

    /* 🏷️ CATEGORY — ARRAY SAFE */
    if (category.trim()) {
      filters.categories = {
        $regex: category.trim(),
        $options: "i",
      };
    }

    /* 📍 CITY */
    if (city.trim()) {
      filters.city = new RegExp(`^${city.trim()}$`, "i");
    }

    /* 📍 ADDRESS */
    if (address.trim()) {
      filters.fullAddress = new RegExp(address.trim(), "i");
    }

    /* 📅 DATE FILTER (WORKS FOR BOTH FIELDS) */
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));

      filters.$or = [
        { eventDateTime: { $gte: start, $lte: end } },
        { date: { $gte: start, $lte: end } },
      ];
    }

    /* ⏳ FUTURE EVENTS (FIXED) */
    if (showPast !== "true") {
      const now = new Date();

      filters.$or = [
        { eventDateTime: { $gte: now } },
        { eventDateTime: { $exists: false }, date: { $gte: now } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const eventsQuery = Event.find(filters)
      .populate("hostId", "name eventsHosted")
      .sort({ eventDateTime: 1, date: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean({ virtuals: true });

    const [events, total] = await Promise.all([
      eventsQuery,
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