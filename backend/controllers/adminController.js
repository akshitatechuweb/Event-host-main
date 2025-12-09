// controllers/adminController.js
import EventHostRequest from "../models/HostRequest.js";
import User from "../models/User.js";

// Approve Event Host Request
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

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been processed",
      });
    }

    // Update request status
    request.status = "approved";
    await request.save();

    // Upgrade user to host
    await User.findByIdAndUpdate(
      request.userId._id,
      {
        role: "host",
        isVerified: true,
        isHostVerified: true,
        isHostRequestPending: false,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Event hosting permission granted successfully!",
      request,
      user: request.userId,
    });
  } catch (error) {
    console.error("Approve Host Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reject Request (Optional but Recommended)
export const rejectEventHost = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { reason } = req.body;

    const request = await EventHostRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Request already processed" });
    }

    request.status = "rejected";
    request.rejectionReason = reason || "Not eligible at this time";
    await request.save();

    res.json({
      success: true,
      message: "Request rejected",
      request,
    });
  } catch (error) {
    console.error("Reject Host Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get All Requests (Admin Dashboard)
export const getAllHostRequests = async (req, res) => {
  try {
    const requests = await EventHostRequest.find()
      .populate("userId", "name phone email city role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get All Requests Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch requests" });
  }
};