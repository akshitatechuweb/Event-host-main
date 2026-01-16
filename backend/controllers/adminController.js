// controllers/adminController.js
import bcrypt from "bcryptjs";
import EventHostRequest from "../models/HostRequest.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Transaction from "../models/Transaction.js";
import Event from "../models/Event.js";
import axios from "axios";
import { computeEventExtras } from "./eventUtils.js";
import { deleteImage } from "../services/cloudinary.js";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const DEFAULT_RADIUS = 20000;

// Get All Approved Hosts (For Creating Events)
export const getAllHosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const p = parseInt(page);
    const l = parseInt(limit);
    const skip = (p - 1) * l;

    const filter = {
      role: "host",
      eventCreationCredits: { $gt: 0 },
    };

    const [hosts, totalItems] = await Promise.all([
      User.find(filter)
        .select("_id name email phone city eventCreationCredits")
        .sort({ name: 1 })
        .skip(skip)
        .limit(l),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total: totalItems,
      hosts: hosts.map((host) => ({
        hostId: host._id.toString(),
        name: host.name || "No Name",
        email: host.email,
        phone: host.phone,
        city: host.city || "Not specified",
      })),
      meta: {
        totalItems,
        currentPage: p,
        limit: l,
        totalPages: Math.ceil(totalItems / l),
      },
    });
  } catch (error) {
    console.error("Get Hosts Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hosts",
      error: error.message,
    });
  }
};

// Get Host ID from Request ID (Very Useful!)
export const getHostIdFromRequestId = async (req, res) => {
  try {
    const requestId = req.params.requestId;

    const request = await EventHostRequest.findById(requestId).populate(
      "userId",
      "_id name email phone city role"
    );

    if (!request || !request.userId) {
      return res.status(404).json({
        success: false,
        message: "Request or user not found",
      });
    }

    res.json({
      success: true,
      message: "Host ID retrieved",
      hostId: request.userId._id.toString(),
      hostDetails: {
        name: request.userId.name,
        email: request.userId.email,
        phone: request.userId.phone,
        city: request.userId.city,
        role: request.userId.role,
      },
    });
  } catch (error) {
    console.error("Get Host ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ========================================================
// ADMIN: Get all transactions/bookings for a specific event
// ========================================================
export const getEventTransactions = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { page = 1, limit = 10, ticketType } = req.query;
    const p = parseInt(page);
    const l = parseInt(limit);
    const skip = (p - 1) * l;

    // Find bookings for the event
    const bookingQuery = { eventId };
    if (ticketType) {
      bookingQuery["items.passType"] = ticketType;
    }

    const bookings = await Booking.find(bookingQuery)
      .populate("userId", "name email phone")
      .lean();

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        success: true,
        transactions: [],
        totals: { totalRevenue: 0, totalTransactions: 0, totalTickets: 0 },
        meta: {
          totalItems: 0,
          currentPage: p,
          limit: l,
          totalPages: 0,
        },
      });
    }

    const bookingMap = {};
    const bookingIds = bookings.map((b) => {
      bookingMap[b._id.toString()] = b;
      return b._id;
    });

    // Find transactions for those bookings
    const [transactions, totalItems] = await Promise.all([
      Transaction.find({ bookingId: { $in: bookingIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .lean(),
      Transaction.countDocuments({ bookingId: { $in: bookingIds } }),
    ]);

    // Calculate totals based on ALL bookings if needed, or maybe just return it
    // For now, let's calculate totals from all transactions associated with these bookings
    const allTransactions = await Transaction.find({
      bookingId: { $in: bookingIds },
    }).lean();

    let totalRevenue = 0;
    let totalTickets = 0;
    allTransactions.forEach((t) => {
      if (t.status === "completed") {
        const booking = bookingMap[t.bookingId.toString()];
        totalTickets += booking?.ticketCount || 0;
        totalRevenue += Number(t.amount || 0);
      }
    });

    // Map transactions to include booking and buyer info
    const items = transactions.map((t) => {
      const booking = bookingMap[t.bookingId.toString()];
      return {
        _id: t._id,
        amount: t.amount,
        platformFee: t.platformFee,
        payoutToHost: t.payoutToHost,
        providerTxnId: t.providerTxnId,
        status: t.status,
        createdAt: t.createdAt,
        booking: booking
          ? {
              _id: booking._id,
              orderId: booking.orderId,
              totalAmount: booking.totalAmount,
              ticketCount: booking.ticketCount,
              items: booking.items,
              buyer: booking.userId
                ? {
                    _id: booking.userId._id,
                    name: booking.userId.name,
                    email: booking.userId.email,
                  }
                : null,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      transactions: items,
      totals: {
        totalRevenue,
        totalTransactions: allTransactions.length,
        totalTickets,
      },
      meta: {
        totalItems,
        currentPage: p,
        limit: l,
        totalPages: Math.ceil(totalItems / l),
      },
    });
  } catch (error) {
    console.error("Get Event Transactions Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================================
// ADMIN: Get Dashboard Statistics
// ========================================================
export const getDashboardStats = async (req, res) => {
  try {
    // Import Event model
    const Event = (await import("../models/Event.js")).default;

    // Aggregate statistics in parallel for better performance
    const [
      totalEvents,
      totalUsers,
      totalTransactions,
      successfulTransactions,
      recentEventsData,
      recentTransactionsData,
    ] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments(),
      Transaction.countDocuments(),
      Transaction.find({ status: "completed" }).lean(),
      Event.find()
        .populate("hostId", "name email")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
      Transaction.find({ status: "completed" })
        .populate({
          path: "bookingId",
          populate: {
            path: "eventId",
            select: "eventName title",
          },
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
    ]);

    // Calculate total revenue from successful transactions
    const totalRevenue = successfulTransactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

    // Format recent events
    const recentEvents = recentEventsData.map((e) => ({
      id: e._id,
      name: e.eventName || e.title || "Unnamed Event",
      host: e.hostId?.name || "Unknown Host",
      date: e.date ? new Date(e.date).toLocaleDateString() : "TBA",
      attendees: Number(e.currentBookings) || 0,
    }));

    // Format recent transactions
    const recentTransactions = recentTransactionsData.map((t) => ({
      id: t._id,
      event:
        t.bookingId?.eventId?.eventName ||
        t.bookingId?.eventId?.title ||
        "Event Payment",
      date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Recent",
      amount: `₹${Number(t.amount || 0).toLocaleString()}`,
      status: "completed",
    }));

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalEvents,
        totalUsers,
        totalTransactions: successfulTransactions.length,
      },
      recentEvents,
      recentTransactions,
      meta: {
        timestamp: new Date().toISOString(),
        eventsOk: true,
        bookingsOk: true,
        usersOk: true,
      },
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    // Return safe fallback data instead of error
    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue: 0,
        totalEvents: 0,
        totalUsers: 0,
        totalTransactions: 0,
      },
      recentEvents: [],
      recentTransactions: [],
      meta: {
        timestamp: new Date().toISOString(),
        eventsOk: false,
        bookingsOk: false,
        usersOk: false,
        error: error.message,
      },
    });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const p = parseInt(page);
    const l = parseInt(limit);
    const skip = (p - 1) * l;

    const eventsCount = await Event.countDocuments({});
    const events = await Event.find({}).lean();
    const confirmedBookings = await Booking.find({
      status: "confirmed",
    }).lean();

    const allTickets = [];

    events.forEach((event) => {
      const passes = event.passes ?? [];

      const eventBookings = confirmedBookings.filter((b) => {
        const bookingEventId = b.eventId?.toString();
        return bookingEventId === event._id.toString();
      });

      const soldByPassType = {};

      eventBookings.forEach((booking) => {
        (booking.items ?? []).forEach((item) => {
          const passType = item.passType;
          const quantity = Number(item.quantity) || 0;

          if (passType && quantity > 0) {
            soldByPassType[passType] =
              (soldByPassType[passType] || 0) + quantity;
          }
        });
      });

      passes.forEach((pass) => {
        const sold = soldByPassType[pass.type] ?? 0;
        const total = Number(pass.totalQuantity) || 0;

        allTickets.push({
          _id: `${event._id}_${pass.type}`,
          eventId: event._id,
          eventName: event.eventName || event.title || "Unknown Event",
          ticketType: pass.type,
          price: Number(pass.price) || 0,
          total,
          sold,
          available: Math.max(0, total - sold),
        });
      });
    });

    // Since this is aggregated in memory, we paginte here
    const totalItems = allTickets.length;
    const paginatedTickets = allTickets.slice(skip, skip + l);

    res.json({
      success: true,
      tickets: paginatedTickets,
      meta: {
        totalItems,
        currentPage: p,
        limit: l,
        totalPages: Math.ceil(totalItems / l),
      },
    });
  } catch (error) {
    console.error("Get All Tickets Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================================
// ADMIN/SUPERADMIN — CREATE EVENT
// ========================================================
export const createEvent = async (req, res) => {
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
      return res
        .status(404)
        .json({ success: false, message: "Host not found" });
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
        message:
          "This host is not approved to create an event. Request approval from admin.",
      });
    }

    if (!date) {
      return res
        .status(400)
        .json({ success: false, message: "Event date is required" });
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
      return res
        .status(400)
        .json({ success: false, message: "Invalid event address" });
    }

    const location = geoRes.data.results[0].geometry.location;

    // Handle image (Cloudinary metadata object expected from frontend)
    let imageObject = null;
    if (typeof eventImage === "string") {
      try {
        imageObject = JSON.parse(eventImage);
      } catch (err) {
        // Fallback for old string-only URLs if any (though we aim for objects now)
        imageObject = { url: eventImage };
      }
    } else if (typeof eventImage === "object") {
      imageObject = eventImage;
    }

    // Fallback for multer upload if signed upload wasn't used
    if (req.file) {
      imageObject = {
        url: req.file.location || `/uploads/${req.file.filename}`,
        publicId: req.file.filename || null,
      };
    }

    // Parse passes
    let inputPasses = [];
    if (req.body.passes) {
      if (typeof req.body.passes === "string") {
        try {
          inputPasses = JSON.parse(req.body.passes);
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format for passes",
          });
        }
      } else if (Array.isArray(req.body.passes)) {
        inputPasses = req.body.passes;
      }
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
      const totalQty = Number(found.totalQuantity) || 0;
      return {
        type,
        price: Number(found.price) || 0,
        totalQuantity: totalQty,
        remainingQuantity: totalQty, // initially same as total
      };
    });

    // Create event
    const newEvent = await Event.create({
      hostId,
      hostedBy: host.name,
      eventName,
      subtitle,
      eventImage: imageObject,
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
      event: (() => {
        const ev = { ...newEvent.toObject() };
        const extras = computeEventExtras(ev, req);
        return {
          ...ev,
          ...extras,
          totalEventsHosted: updatedHost.eventsHosted,
          category: newEvent.category, // ← Ensures category is returned
        };
      })(),
    });
  } catch (err) {
    console.error("Create Event Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================================================
// ADMIN/SUPERADMIN — UPDATE EVENT
// ========================================================
export const updateEvent = async (req, res) => {
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
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Update host if changed
    if (hostId && hostId !== event.hostId.toString()) {
      const newHost = await User.findById(hostId);
      if (!newHost || newHost.role !== "host") {
        return res
          .status(400)
          .json({ success: false, message: "Invalid host" });
      }
      await User.findByIdAndUpdate(event.hostId, {
        $inc: { eventsHosted: -1 },
      });
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

    // Update image (Cloudinary lifecycle)
    const oldImagePublicId = event.eventImage?.publicId;
    let newImageObject = null;

    if (req.file) {
      newImageObject = {
        url: req.file.location || `/uploads/${req.file.filename}`,
        publicId: req.file.filename || null,
      };
    } else if (eventImage && typeof eventImage === "object") {
      newImageObject = eventImage;
    } else if (typeof eventImage === "string" && eventImage.trim() !== "") {
      try {
        newImageObject = JSON.parse(eventImage);
      } catch (err) {
        // If it's a raw URL string, we don't know the publicId, so we just update the URL
        if (event.eventImage?.url !== eventImage) {
          newImageObject = { url: eventImage };
        }
      }
    }

    if (newImageObject) {
      event.eventImage = newImageObject;
      // Delete old image if it's a Cloudinary image and different from new one
      if (oldImagePublicId && oldImagePublicId !== newImageObject.publicId) {
        await deleteImage(oldImagePublicId);
      }
    }

    // Update passes (supports totalQuantity)
    if (req.body.passes) {
      let inputPasses = [];
      if (typeof req.body.passes === "string") {
        try {
          inputPasses = JSON.parse(req.body.passes);
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format for passes",
          });
        }
      } else if (Array.isArray(req.body.passes)) {
        inputPasses = req.body.passes;
      }

      if (!Array.isArray(inputPasses)) {
        return res
          .status(400)
          .json({ success: false, message: "passes must be an array" });
      }

      const defaultPassTypes = ["Male", "Female", "Couple"];

      const normalizedPasses = defaultPassTypes.map((type) => {
        const found = inputPasses.find((p) => p.type === type) || {};
        const totalQty = Number(found.totalQuantity) || 0;
        return {
          type,
          price: Number(found.price) || 0,
          totalQuantity: totalQty,
          remainingQuantity: totalQty,
        };
      });

      event.passes = normalizedPasses;
    }

    // Update other fields
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

    const updatedHost = await User.findById(event.hostId).select(
      "eventsHosted"
    );

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: (() => {
        const ev = { ...event.toObject() };
        const extras = computeEventExtras(ev, req);
        return {
          ...ev,
          ...extras,
          totalEventsHosted: updatedHost?.eventsHosted || 0,
          category: event.category, // ← Ensures category is returned
        };
      })(),
    });
  } catch (err) {
    console.error("Update Event Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
// ========================================================
// ADMIN: Update Profile
// ========================================================
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (req.file) {
      const oldPhoto = user.photos?.find((p) => p.isProfilePhoto);
      const photoUrl = req.file.location || "/uploads/" + req.file.filename;
      const publicId = req.file.filename || null;

      user.photos = user.photos || [];
      user.photos = user.photos.map((p) => ({ ...p, isProfilePhoto: false }));
      user.photos.push({
        url: photoUrl,
        publicId: publicId,
        isProfilePhoto: true,
      });

      // Cleanup old Cloudinary photo
      if (oldPhoto?.publicId) {
        await deleteImage(oldPhoto.publicId);
      }
    } else if (
      req.body.profilePhoto &&
      typeof req.body.profilePhoto === "object"
    ) {
      const oldPhoto = user.photos?.find((p) => p.isProfilePhoto);
      const newPhoto = req.body.profilePhoto;

      user.photos = user.photos || [];
      user.photos = user.photos.map((p) => ({ ...p, isProfilePhoto: false }));
      user.photos.push({ ...newPhoto, isProfilePhoto: true });

      if (oldPhoto?.publicId && oldPhoto.publicId !== newPhoto.publicId) {
        await deleteImage(oldPhoto.publicId);
      }
    }

    await user.save();

    let profilePhoto = user.photos?.find((p) => p.isProfilePhoto)?.url || null;
    if (profilePhoto && profilePhoto.startsWith("/")) {
      profilePhoto = `${req.protocol}://${req.get("host")}${profilePhoto}`;
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions, // 🚩 FIX: Keep permissions synced after profile update
        profilePhoto,
      },
    });
  } catch (error) {
    console.error("Update Admin Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========================================================
// ADMIN: Update Password
// ========================================================
export const updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    let isMatch = false;
    if (user.password) {
      isMatch = await bcrypt.compare(currentPassword, user.password);
    } else {
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
      const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
      const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;

      if (user.email === ADMIN_EMAIL && currentPassword === ADMIN_PASSWORD) {
        isMatch = true;
      } else if (
        user.email === SUPERADMIN_EMAIL &&
        currentPassword === SUPERADMIN_PASSWORD
      ) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect current password" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Update Admin Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========================================================
// ADMIN: Get all users
// ========================================================
export const getAllUsers = async (req, res) => {
  try {
    // Summary mode for dashboard
    if (req.query.summary === "true") {
      // Only count app users (exclude hosts/admins)
      const users = await User.find({ role: "user" }).select("_id").lean();

      return res.status(200).json({
        success: true,
        users: users || [],
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    const p = parseInt(page);
    const l = parseInt(limit);
    const skip = (p - 1) * l;

    const filter = { role: "user" };
    if (status === "active") {
      filter.isActive = true;
    } else if (status === "deactivated") {
      filter.isActive = false;
    }

    // List mode for Admin Panel - return only app users by default
    const [users, totalItems, stats] = await Promise.all([
      User.find(filter)
        .select(
          "name email phone city gender role isHost isVerified isActive createdAt profileCompletion isHostRequestPending"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .lean(),
      User.countDocuments(filter),
      (async () => ({
        total: await User.countDocuments({ role: "user" }),
        active: await User.countDocuments({ role: "user", isActive: true }),
        deactivated: await User.countDocuments({
          role: "user",
          isActive: false,
        }),
      }))(),
    ]);

    return res.status(200).json({
      success: true,
      users: users || [],
      stats,
      meta: {
        totalItems,
        currentPage: p,
        limit: l,
        totalPages: Math.ceil(totalItems / l),
      },
    });
  } catch (err) {
    console.error("❌ Admin users failed:", err);

    // 🔑 Never fail dashboard
    return res.status(200).json({
      success: true,
      users: [],
    });
  }
};

// ========================================================
// ADMIN: Deactivate user
// ========================================================
export const deactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User deactivated successfully",
      user,
    });
  } catch (err) {
    console.error("Error deactivating user:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to deactivate user" });
  }
};
