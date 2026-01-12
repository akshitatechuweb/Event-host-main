// controllers/adminController.js
import bcrypt from "bcryptjs";
import EventHostRequest from "../models/HostRequest.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Transaction from "../models/Transaction.js";
import Event from "../models/Event.js";
import axios from "axios";
import { computeEventExtras } from "./eventUtils.js";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const DEFAULT_RADIUS = 20000;

// Approve Event Host Request
export const approveEventHost = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await EventHostRequest.findById(requestId)
      .populate("userId", "name phone email city");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Host request not found",
      });
    }

    if (request.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "This request is already approved",
      });
    }

    // Update request
    request.status = "approved";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Critical Fix: Use findOne({ _id: ... }) because your _id is string
    const user = await User.findOne({ _id: request.userId._id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in database",
      });
    }

    // Upgrade user to host
    if (user.role !== "host") {
      user.role = "host";
      user.isVerified = true;
      user.isHostVerified = true;
    }
    user.isHostRequestPending = false;
    user.eventCreationCredits = (user.eventCreationCredits || 0) + 1;
    await user.save();

    res.json({
      success: true,
      message: "Event hosting permission granted successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role,
        isHostVerified: user.isHostVerified,
      },
    });
  } catch (error) {
    console.error("Approve Host Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Reject Event Host Request
export const rejectEventHost = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { reason } = req.body;

    const request = await EventHostRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Request already rejected",
      });
    }

    request.status = "rejected";
    request.rejectionReason = reason || "Not eligible at this time";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Safe update for string _id
    await User.updateOne(
      { _id: request.userId },
      { isHostRequestPending: false }
    );

    res.json({
      success: true,
      message: "Host request rejected successfully",
      request,
    });
  } catch (error) {
    console.error("Reject Host Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get All Host Requests (Admin Dashboard)
export const getAllHostRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = status ? { status } : {};

    const requests = await EventHostRequest.find(filter)
      .populate("userId", "name phone email city role")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    const stats = {
      total: requests.length,
      pending: await EventHostRequest.countDocuments({ status: "pending" }),
      approved: await EventHostRequest.countDocuments({ status: "approved" }),
      rejected: await EventHostRequest.countDocuments({ status: "rejected" }),
    };

    res.json({
      success: true,
      stats,
      requests,
    });
  } catch (error) {
    console.error("Get All Requests Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
      error: error.message,
    });
  }
};

// Get Single Request Details
export const getRequestById = async (req, res) => {
  try {
    const request = await EventHostRequest.findById(req.params.id)
      .populate("userId", "name phone email city role")
      .populate("reviewedBy", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Get Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get All Approved Hosts (For Creating Events)
export const getAllHosts = async (req, res) => {
  try {
    const hosts = await User.find({
      role: "host",
      eventCreationCredits: { $gt: 0 }
    })
      .select("_id name email phone city eventCreationCredits")
      .sort({ name: 1 });

    res.json({
      success: true,
      total: hosts.length,
      hosts: hosts.map(host => ({
        hostId: host._id.toString(),
        name: host.name || "No Name",
        email: host.email,
        phone: host.phone,
        city: host.city || "Not specified",
      })),
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

    const request = await EventHostRequest.findById(requestId)
      .populate("userId", "_id name email phone city role");

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

    // Find bookings for the event
    const bookings = await Booking.find({ eventId })
      .populate("userId", "name email phone")
      .lean();

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({ success: true, transactions: [], totals: { totalRevenue: 0, totalTransactions: 0, totalTickets: 0 } });
    }

    const bookingMap = {};
    const bookingIds = bookings.map((b) => {
      bookingMap[b._id.toString()] = b;
      return b._id;
    });

    // Find transactions for those bookings
    const transactions = await Transaction.find({ bookingId: { $in: bookingIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Map transactions to include booking and buyer info
    let totalRevenue = 0;
    let totalTickets = 0;

    const items = transactions.map((t) => {
      const booking = bookingMap[t.bookingId.toString()];
      const ticketCount = booking?.ticketCount || 0;
      if (t.status === "completed") {
        totalTickets += ticketCount;
        totalRevenue += Number(t.amount || 0);
      }

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
            buyer: booking.userId ? { _id: booking.userId._id, name: booking.userId.name, email: booking.userId.email } : null,
          }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      transactions: items,
      totals: {
        totalRevenue,
        totalTransactions: transactions.length,
        totalTickets,
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
      recentTransactionsData
    ] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments(),
      Transaction.countDocuments(),
      Transaction.find({ status: "completed" }).lean(),
      Event.find()
        .populate("hostId", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Transaction.find({ status: "completed" })
        .populate({
          path: "bookingId",
          populate: {
            path: "eventId",
            select: "eventName title"
          }
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
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
      event: t.bookingId?.eventId?.eventName || t.bookingId?.eventId?.title || "Event Payment",
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
    const events = await Event.find({}).lean();
    const confirmedBookings = await Booking.find({ status: "confirmed" }).lean();

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
            soldByPassType[passType] = (soldByPassType[passType] || 0) + quantity;
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

    res.json({
      success: true,
      tickets: allTickets,
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

    // Handle image upload
    let imagePath = eventImage;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Parse passes
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

    // Update image

    // Case 1: New image uploaded → replace old image
    if (req.file) {
      event.eventImage = `/uploads/${req.file.filename}`;
    }

    // Case 2: No new file, but frontend explicitly sent existing image
    else if (
      typeof req.body.eventImage === "string" &&
      req.body.eventImage.trim() !== ""
    ) {
      event.eventImage = req.body.eventImage;
    }

    // Case 3: Nothing sent → DO NOTHING (preserve existing image)

    // Update passes (supports totalQuantity)
    if (req.body.passes) {
      let inputPasses = [];
      try {
        inputPasses = JSON.parse(req.body.passes);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid JSON format for passes" });
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
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (req.file) {
      const photoUrl = '/uploads/' + req.file.filename;
      user.photos = user.photos || [];
      user.photos = user.photos.map((p) => ({ ...p, isProfilePhoto: false }));
      user.photos.push({ url: photoUrl, isProfilePhoto: true });
    }

    await user.save();

    let profilePhoto = user.photos?.find((p) => p.isProfilePhoto)?.url || null;
    if (profilePhoto && profilePhoto.startsWith("/")) {
      profilePhoto = `${req.protocol}://${req.get("host")}${profilePhoto}`;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePhoto
      }
    });
  } catch (error) {
    console.error('Update Admin Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
      return res.status(404).json({ success: false, message: 'Admin not found' });
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
      } else if (user.email === SUPERADMIN_EMAIL && currentPassword === SUPERADMIN_PASSWORD) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update Admin Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
      const users = await User.find({ role: "user" })
        .select("_id")
        .lean();

      return res.status(200).json({
        success: true,
        users: users || [],
      });
    }

    // List mode for Admin Panel - return only app users by default
    const users = await User.find({ role: "user" })
      .select("name email phone city gender role isHost isVerified isActive createdAt profileCompletion")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      users: users || [],
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
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User deactivated successfully",
      user
    });
  } catch (err) {
    console.error("Error deactivating user:", err);
    res.status(500).json({ success: false, message: "Failed to deactivate user" });
  }
};
