// controllers/adminController.js
import EventHostRequest from "../models/HostRequest.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Transaction from "../models/Transaction.js";
import Event from "../models/Event.js";

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
      $or: [{ role: "host" }, { isHostVerified: true }]
    })
      .select("_id name email phone city")
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
      totalTickets += ticketCount;
      totalRevenue += Number(t.amount || 0);

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
      Transaction.find({ status: "success" }).lean(),
      Event.find()
        .populate("hostId", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Transaction.find({ status: "success" })
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
      attendees: Number(e.attendeesCount) || 0,
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