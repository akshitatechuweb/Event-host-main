// controllers/hostController.js
import EventHostRequest from "../models/HostRequest.js";
import User from "../models/User.js";

export const requestEventHostAccess = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Optional message from body
    const message =
      req.body?.message?.trim() ||
      "I want permission to organize an event.";

    const user = await User.findById(userId);

    // Check if user is a HOST (only hosts can organize events)
    if (user.role !== "host") {
      return res.status(403).json({
        success: false,
        message: "Only hosts can request to organize events. Please request host access first.",
      });
    }

    // Check if user already has a pending event request
    const existingPending = await EventHostRequest.findOne({
      userId,
      status: "pending",
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending event request. Please wait for admin approval.",
      });
    }

    // Create NEW event organization request
    const newRequest = await EventHostRequest.create({
      userId,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Event organization request sent successfully!",
      request: newRequest,
    });
  } catch (error) {
    console.error("Event Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send request",
      error: error.message,
    });
  }
};