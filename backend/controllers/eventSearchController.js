// src/controllers/eventSearchController.js
import Event from "../models/Event.js";
import User from "../models/User.js";

const addEventExtras = (event, req) => {
  let imageUrl = event.eventImage;
  if (imageUrl && imageUrl.startsWith("/")) {
    imageUrl = `${req.protocol}://${req.get("host")}${imageUrl}`;
  }

  const bookingPercentage = event.maxCapacity > 0
    ? Math.round((event.currentBookings / event.maxCapacity) * 100)
    : null;

  return {
    ...event,
    eventImage: imageUrl,
    bookingPercentage,
    hostedBy: event.hostId?.name || event.hostedBy,
    totalEventsHosted: event.hostId?.eventsHosted || 0,
  };
};

export const searchEvents = async (req, res) => {
  try {
    const {
      q = "",
      city = "",
      category = "",
      date = "",
      startDate = "",
      endDate = "",
      lat = "",
      lng = "",
      radius = "10000",
      page = 1,
      limit = 15,
    } = req.query;

    const filters = { eventDateTime: { $gte: new Date() } };

    if (q.trim()) filters.$text = { $search: q.trim() };
    if (category.trim()) filters.category = new RegExp(`^${category.trim()}$`, "i");

    // Time filters
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      filters.eventDateTime = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        filters.eventDateTime.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        filters.eventDateTime.$lte = e;
      }
    }

    let locationApplied = false;

    // Priority 1: Near me (lat/lng)
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxDist = parseInt(radius) || 10000;
      if (!isNaN(userLat) && !isNaN(userLng)) {
        filters.location = {
          $near: {
            $geometry: { type: "Point", coordinates: [userLng, userLat] },
            $maxDistance: maxDist,
          },
        };
        locationApplied = true;
      }
    }

    // Priority 2: Logged-in user's saved city
    else if (!locationApplied && req.user?._id) {
      const user = await User.findById(req.user._id).select("city");
      if (user?.city?.trim()) {
        filters.city = new RegExp(`^${user.city.trim()}$`, "i");
        locationApplied = true;
      }
    }

    // Priority 3: Manual city param
    else if (!locationApplied && city.trim()) {
      filters.city = new RegExp(`^${city.trim()}$`, "i");
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    let query = Event.find(filters)
      .populate("hostId", "name eventsHosted")
      .skip(skip)
      .limit(limitNum)
      .lean({ virtuals: true });

    if (q.trim()) {
      query = query.sort({ score: { $meta: "textScore" }, eventDateTime: 1 });
    } else {
      query = query.sort({ eventDateTime: 1 });
    }

    const [events, total] = await Promise.all([
      query,
      Event.countDocuments(filters),
    ]);

    const formatted = events.map(ev => addEventExtras(ev, req));

    res.json({
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
    res.status(500).json({ success: false, message: "Failed to search events" });
  }
};