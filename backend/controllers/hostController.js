// controllers/hostController.js
import EventHostRequest from "../models/HostRequest.js";

export const requestEventHostAccess = async (req, res) => {
  try {
    const userId = req.user._id;
    const message = req.body.message?.trim() || "I want permission to host events.";

    const newRequest = await EventHostRequest.create({
      userId,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Event host request sent successfully!",
      request: newRequest,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request. Please wait for admin approval.",
      });
    }
    console.error("Host Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to send request" });
  }
};