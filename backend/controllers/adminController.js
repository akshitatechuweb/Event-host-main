import EventHostRequest from "../models/HostRequest.js";
import User from "../models/User.js";

export const approveEventHost = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await EventHostRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    request.status = "approved";
    await request.save();

    await User.findByIdAndUpdate(request.userId, {
      role: "host",
    });

    res.status(200).json({
      success: true,
      message: "Event hosting permission granted!",
      request,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
