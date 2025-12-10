// controllers/adminController.js
import EventHostRequest from "../models/HostRequest.js";
import User from "../models/User.js";

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