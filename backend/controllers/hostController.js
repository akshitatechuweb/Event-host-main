import EventHostRequest from "../models/HostRequest.js";
import User from "../models/User.js";

export const requestEventHostAccess = async (req, res) => {
  try {
    const userId = req.user._id;

    // If user does not send any body → default message
    const message =
      req.body?.message?.trim() ||
      "I want permission to host events.";

    const user = await User.findById(userId);

    // User is already a HOST
    if (user.role === "host") {
      return res.status(400).json({
        success: false,
        message: "You are already a Host",
      });
    }

    // User already has a pending request
    const existingPending = await EventHostRequest.findOne({
      userId,
      status: "pending",
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request. Please wait for admin approval.",
      });
    }

    // Create NEW request
    const newRequest = await EventHostRequest.create({
      userId,
      message,
    });

    // Mark user as "requested"
    user.isHostRequestPending = true;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Event host request sent successfully!",
      request: newRequest,
    });
  } catch (error) {
    console.error("Host Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send request",
    });
  }
};
