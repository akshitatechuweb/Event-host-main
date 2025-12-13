import Event from "../models/Event.js";
import User from "../models/User.js";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const DEFAULT_RADIUS = 10000;

// ========================================================
// ADMIN/SUPERADMIN — CREATE EVENT (with permission check + pass setup)
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
        message: "Only hosts can be assigned to events",
      });
    }

    // ========================================================
    // 🛑 Host must have eventCreationCredits > 0
    // ========================================================
    if (host.eventCreationCredits <= 0) {
      return res.status(403).json({
        success: false,
        message: "This host is not approved to create an event. Request approval from admin.",
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

    // ========================================================
    // 🟢 Host uses up ONE event creation credit
    // ========================================================
    host.eventCreationCredits -= 1;
    await host.save();

    // Update host stats
    const updatedHost = await User.findByIdAndUpdate(
      hostId,
      { $inc: { eventsHosted: 1 } },
      { new: true, select: "name eventsHosted" }
    );

    // Clean response
    const eventObj = newEvent.toObject();

    // Response
    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: {
        ...eventObj,
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
      maxCapacity
    } = req.body;

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Admin/Superadmin can update any event
    // No ownership check needed since only admin/superadmin can access this route

    // Update host if provided
    if (hostId && hostId !== event.hostId.toString()) {
      const newHost = await User.findById(hostId);
      if (!newHost) {
        return res.status(404).json({ success: false, message: "New host not found" });
      }
      if (newHost.role !== "host") {
        return res.status(403).json({
          success: false,
          message: "Only hosts can be assigned to events",
        });
      }
      
      // Update old host stats
      await User.findByIdAndUpdate(
        event.hostId,
        { $inc: { eventsHosted: -1 } }
      );
      
      // Update new host stats
      await User.findByIdAndUpdate(
        hostId,
        { $inc: { eventsHosted: 1 } }
      );
      
      event.hostId = hostId;
      event.hostedBy = newHost.name;
    }

    // Update date if provided
    if (date) {
      const eventDate = new Date(date);
      const weekday = eventDate.toLocaleDateString("en-US", { weekday: "long" });
      event.date = eventDate;
      event.day = weekday;

      if (time) {
        const [h, m] = time.split(":");
        const eventDateTime = new Date(eventDate);
        eventDateTime.setHours(parseInt(h), parseInt(m), 0, 0);
        event.eventDateTime = eventDateTime;
      }
    }

    if (time) event.time = time;

    // Update location if address changed
    if (fullAddress && fullAddress !== event.fullAddress) {
      const geoRes = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address: fullAddress,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      if (geoRes.data.results.length) {
        const location = geoRes.data.results[0].geometry.location;
        event.location = {
          type: "Point",
          coordinates: [location.lng, location.lat],
        };
        event.fullAddress = fullAddress;
      }
    }

    // Update image if new file uploaded
    if (req.file) {
      event.eventImage = `/uploads/${req.file.filename}`;
    } else if (eventImage) {
      event.eventImage = eventImage;
    }

    // Update passes if provided
    if (req.body.passes) {
      try {
        const inputPasses = JSON.parse(req.body.passes);
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

        event.passes = normalizedPasses;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for passes",
        });
      }
    }

    // Update other fields
    if (eventName) event.eventName = eventName;
    if (subtitle !== undefined) event.subtitle = subtitle;
    if (city) event.city = city;
    if (about !== undefined) event.about = about;
    if (partyFlow !== undefined) event.partyFlow = partyFlow;
    if (partyEtiquette !== undefined) event.partyEtiquette = partyEtiquette;
    if (whatsIncluded !== undefined) event.whatsIncluded = whatsIncluded;
    if (houseRules !== undefined) event.houseRules = houseRules;
    if (howItWorks !== undefined) event.howItWorks = howItWorks;
    if (cancellationPolicy !== undefined) event.cancellationPolicy = cancellationPolicy;
    if (ageRestriction !== undefined) event.ageRestriction = ageRestriction;
    if (whatsIncludedInTicket !== undefined) event.whatsIncludedInTicket = whatsIncludedInTicket;
    if (expectedGuestCount !== undefined) event.expectedGuestCount = expectedGuestCount;
    if (maleToFemaleRatio !== undefined) event.maleToFemaleRatio = maleToFemaleRatio;
    if (category !== undefined) event.category = category;
    if (thingsToKnow !== undefined) event.thingsToKnow = thingsToKnow;
    if (partyTerms !== undefined) event.partyTerms = partyTerms;
    if (maxCapacity !== undefined) event.maxCapacity = maxCapacity;

    await event.save();

    const updatedHost = await User.findById(event.hostId).select("name eventsHosted");

    const eventObj = event.toObject();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: {
        ...eventObj,
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
      .sort({ eventDateTime: 1 });

    const formatted = events.map((ev) => {
      const eventObj = ev.toObject();
      return {
        ...eventObj,
        hostedBy: ev.hostId?.name,
        totalEventsHosted: ev.hostId?.eventsHosted || 0,
        trending: trendingOnly === "true",
      };
    });

    return res.status(200).json({ success: true, events: formatted });

  } catch (err) {
    console.error("Get Events Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};