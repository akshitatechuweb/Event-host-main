// controllers/adminController.js
import EventHostRequest from "../models/HostRequest.js";
import User from "../models/User.js";

// Approve Event Host Request (with re-approval support)
export const approveEventHost = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await EventHostRequest.findById(requestId)
      .populate("userId", "name phone email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Allow re-approval of rejected requests
    if (request.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "This request is already approved",
      });
    }

    // Update request status
    request.status = "approved";
    request.reviewedBy = req.user._id; // Admin who approved
    request.reviewedAt = new Date();
    await request.save();

    // Get user details
    const user = await User.findById(request.userId._id);

    // Only upgrade if user is not already a host
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
      request,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isHostVerified: user.isHostVerified,
      },
    });
  } catch (error) {
    console.error("Approve Host Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

// Reject Request
export const rejectEventHost = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { reason } = req.body;

    const request = await EventHostRequest.findById(requestId)
      .populate("userId", "name phone email");

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: "Request not found" 
      });
    }

    if (request.status === "rejected") {
      return res.status(400).json({ 
        success: false, 
        message: "Request already rejected" 
      });
    }

    request.status = "rejected";
    request.rejectionReason = reason || "Not eligible at this time";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Update user
    await User.findByIdAndUpdate(request.userId._id, {
      isHostRequestPending: false,
    });

    res.json({
      success: true,
      message: "Request rejected successfully",
      request,
    });
  } catch (error) {
    console.error("Reject Host Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

// Get All Requests (Admin Dashboard)
export const getAllHostRequests = async (req, res) => {
  try {
    const { status } = req.query; // Filter by status: ?status=pending

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
      error: error.message 
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
      error: error.message 
    });
  }
};

// 🆕 Get all approved hosts (for event creation)
export const getAllHosts = async (req, res) => {
  try {
    const hosts = await User.find({ role: "host" })
      .select("_id name email phone city")
      .sort({ name: 1 });

    res.json({
      success: true,
      total: hosts.length,
      hosts: hosts.map(host => ({
        hostId: host._id,  // Use this ID when creating events
        name: host.name,
        email: host.email,
        phone: host.phone,
        city: host.city,
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

// 🆕 Get host user ID from request ID
export const getHostIdFromRequestId = async (req, res) => {
  try {
    const requestId = req.params.requestId;

    const request = await EventHostRequest.findById(requestId)
      .populate("userId", "_id name email phone city role");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (!request.userId) {
      return res.status(404).json({
        success: false,
        message: "Host user not found for this request",
      });
    }

    const host = request.userId;

    res.json({
      success: true,
      message: "Host ID retrieved successfully",
      hostId: host._id.toString(),  // Use this ID when creating events
      hostDetails: {
        name: host.name,
        email: host.email,
        phone: host.phone,
        city: host.city,
        role: host.role,
        isHost: host.role === "host",
      },
      requestInfo: {
        requestId: request._id,
        status: request.status,
        message: request.message,
        createdAt: request.createdAt,
      },
    });
  } catch (error) {
    console.error("Get Host ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch host ID",
      error: error.message,
    });
  }
};