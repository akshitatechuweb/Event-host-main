import EventHostRequest from "../models/HostRequest.js";

export const requestEventHostAccess = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if already requested
    const already = await EventHostRequest.findOne({ userId, status: "pending" });
    if (already) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending event host request!",
      });
    }

    const newRequest = await EventHostRequest.create({
      userId,
      message: req.body.message || "I want permission to host events.",
    });

    res.status(200).json({
      success: true,
      message: "Event host request sent successfully!",
      request: newRequest,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
